from flask import Blueprint, jsonify, request

from teacher import (
    get_all_teachers,
    get_teacher_by_id,
    add_teacher_record,
    update_teacher_record,
    delete_teacher_record
)

teacher_bp = Blueprint("teacher_bp", __name__)


@teacher_bp.route("/api/teachers", methods=["GET"])
def get_teachers():
    return jsonify(get_all_teachers()), 200


@teacher_bp.route("/api/teachers/<int:teacher_id>", methods=["GET"])
def get_teacher(teacher_id):

    teacher = get_teacher_by_id(teacher_id)

    if teacher is None:
        return jsonify({
            "message": "Teacher not found"
        }), 404

    return jsonify(teacher), 200


@teacher_bp.route("/api/teachers", methods=["POST"])
def add_teacher():

    data = request.get_json()

    teacher = add_teacher_record(
        data["first_name"],
        data["last_name"],
        data["contact"],
        data["email"]
    )

    return jsonify(teacher), 201


@teacher_bp.route("/api/teachers/<int:teacher_id>", methods=["PUT"])
def update_teacher(teacher_id):

    data = request.get_json()

    updated = update_teacher_record(
        teacher_id,
        data["first_name"],
        data["last_name"],
        data["contact"],
        data["email"]
    )

    if updated is False:
        return jsonify({
            "message": "Teacher not found"
        }), 404

    return jsonify({
        "message": "Teacher updated successfully"
    }), 200


@teacher_bp.route("/api/teachers/<int:teacher_id>", methods=["DELETE"])
def delete_teacher(teacher_id):

    deleted = delete_teacher_record(teacher_id)

    if deleted is None:
        return jsonify({
            "message": "Cannot delete teacher because attendance records exist."
        }), 400

    if deleted is False:
        return jsonify({
            "message": "Teacher not found"
        }), 404

    return jsonify({
        "message": "Teacher deleted successfully"
    }), 200