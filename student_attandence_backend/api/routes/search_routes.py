from flask import Blueprint, jsonify

from search import (
    search_student_by_name_record,
    search_student_by_roll_record,
    search_subject_record,
    search_teacher_record
)

search_bp = Blueprint("search_bp", __name__)


# -------------------------
# SEARCH STUDENT BY NAME
# -------------------------

@search_bp.route("/api/search/student/name/<string:name>", methods=["GET"])
def search_student_name(name):

    students = search_student_by_name_record(name)

    return jsonify(students), 200


# -------------------------
# SEARCH STUDENT BY ROLL
# -------------------------

@search_bp.route("/api/search/student/roll/<string:roll>", methods=["GET"])
def search_student_roll(roll):

    students = search_student_by_roll_record(roll)

    return jsonify(students), 200


# -------------------------
# SEARCH SUBJECT
# -------------------------

@search_bp.route("/api/search/subject/<string:name>", methods=["GET"])
def search_subject(name):

    subjects = search_subject_record(name)

    return jsonify(subjects), 200


# -------------------------
# SEARCH TEACHER
# -------------------------

@search_bp.route("/api/search/teacher/<string:name>", methods=["GET"])
def search_teacher(name):

    teachers = search_teacher_record(name)

    return jsonify(teachers), 200