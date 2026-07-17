from flask import Blueprint, jsonify, request

from attendence import (
    get_all_attendance_records,
    get_attendance_by_id,
    add_attendance_record,
    update_attendance_record,
    delete_attendance_record,
    get_attendance_percentage_record
)

attendance_bp = Blueprint("attendance_bp", __name__)


# -------------------------
# GET ALL ATTENDANCE
# -------------------------

@attendance_bp.route("/api/attendance", methods=["GET"])
def get_attendance():

    records = get_all_attendance_records()

    return jsonify(records), 200


# -------------------------
# GET ATTENDANCE BY ID
# -------------------------

@attendance_bp.route("/api/attendance/<int:attendance_id>", methods=["GET"])
def get_attendance_record(attendance_id):

    record = get_attendance_by_id(attendance_id)

    if record is None:
        return jsonify({
            "message": "Attendance record not found"
        }), 404

    return jsonify(record), 200


# -------------------------
# ADD ATTENDANCE
# -------------------------

@attendance_bp.route("/api/attendance", methods=["POST"])
def add_attendance():

    data = request.get_json()

    record = add_attendance_record(
        data["student_id"],
        data["subject_id"],
        data["teacher_id"],
        data["status"]
    )

    return jsonify(record), 201


# -------------------------
# UPDATE ATTENDANCE
# -------------------------

@attendance_bp.route("/api/attendance/<int:attendance_id>", methods=["PUT"])
def update_attendance(attendance_id):

    data = request.get_json()

    updated = update_attendance_record(
        attendance_id,
        data["status"]
    )

    if updated is False:
        return jsonify({
            "message": "Attendance record not found"
        }), 404

    return jsonify({
        "message": "Attendance updated successfully"
    }), 200


# -------------------------
# DELETE ATTENDANCE
# -------------------------

@attendance_bp.route("/api/attendance/<int:attendance_id>", methods=["DELETE"])
def delete_attendance(attendance_id):

    deleted = delete_attendance_record(attendance_id)

    if deleted is False:
        return jsonify({
            "message": "Attendance record not found"
        }), 404

    return jsonify({
        "message": "Attendance deleted successfully"
    }), 200


# -------------------------
# ATTENDANCE PERCENTAGE
# -------------------------

@attendance_bp.route("/api/attendance/percentage/<int:student_id>", methods=["GET"])
def attendance_percentage(student_id):

    result = get_attendance_percentage_record(student_id)

    if result is None:
        return jsonify({
            "message": "Student not found"
        }), 404

    return jsonify(result), 200