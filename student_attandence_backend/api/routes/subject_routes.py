from flask import Blueprint, jsonify, request

from subject import (
    get_all_subjects,
    get_subject_by_id,
    add_subject_record,
    update_subject_record,
    delete_subject_record
)

subject_bp = Blueprint("subject_bp", __name__)


# -------------------------
# GET ALL SUBJECTS
# -------------------------

@subject_bp.route("/api/subjects", methods=["GET"])
def get_subjects():

    return jsonify(get_all_subjects()), 200


# -------------------------
# GET SUBJECT BY ID
# -------------------------

@subject_bp.route("/api/subjects/<int:subject_id>", methods=["GET"])
def get_subject(subject_id):

    subject = get_subject_by_id(subject_id)

    if subject is None:
        return jsonify({
            "message": "Subject not found"
        }), 404

    return jsonify(subject), 200


# -------------------------
# ADD SUBJECT
# -------------------------

@subject_bp.route("/api/subjects", methods=["POST"])
def add_subject():

    data = request.get_json()

    subject = add_subject_record(
        data["subject_name"],
        data["subject_code"]
    )

    return jsonify(subject), 201


# -------------------------
# UPDATE SUBJECT
# -------------------------

@subject_bp.route("/api/subjects/<int:subject_id>", methods=["PUT"])
def update_subject(subject_id):

    data = request.get_json()

    updated = update_subject_record(
        subject_id,
        data["subject_name"],
        data["subject_code"]
    )

    if updated is False:
        return jsonify({
            "message": "Subject not found"
        }), 404

    return jsonify({
        "message": "Subject updated successfully"
    }), 200


# -------------------------
# DELETE SUBJECT
# -------------------------

@subject_bp.route("/api/subjects/<int:subject_id>", methods=["DELETE"])
def delete_subject(subject_id):

    deleted = delete_subject_record(subject_id)

    if deleted is None:
        return jsonify({
            "message": "Cannot delete subject because attendance records exist."
        }), 400

    if deleted is False:
        return jsonify({
            "message": "Subject not found"
        }), 404

    return jsonify({
        "message": "Subject deleted successfully"
    }), 200