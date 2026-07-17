from flask import Blueprint, jsonify

from report import (
    get_student_report,
    get_subject_report,
    get_teacher_report,
    get_daily_report,
    get_date_range_report
)

report_bp = Blueprint("report_bp", __name__)


# -------------------------
# STUDENT REPORT
# -------------------------

@report_bp.route("/api/reports/student/<int:student_id>", methods=["GET"])
def student_report(student_id):

    data = get_student_report(student_id)

    return jsonify(data), 200


# -------------------------
# SUBJECT REPORT
# -------------------------

@report_bp.route("/api/reports/subject/<int:subject_id>", methods=["GET"])
def subject_report(subject_id):

    data = get_subject_report(subject_id)

    return jsonify(data), 200


# -------------------------
# TEACHER REPORT
# -------------------------

@report_bp.route("/api/reports/teacher/<int:teacher_id>", methods=["GET"])
def teacher_report(teacher_id):

    data = get_teacher_report(teacher_id)

    return jsonify(data), 200


# -------------------------
# DAILY REPORT
# -------------------------

@report_bp.route("/api/reports/daily/<attendance_date>", methods=["GET"])
def daily_report(attendance_date):

    data = get_daily_report(attendance_date)

    return jsonify(data), 200


# -------------------------
# DATE RANGE REPORT
# -------------------------

@report_bp.route(
    "/api/reports/date-range/<start_date>/<end_date>",
    methods=["GET"]
)
def date_range_report(start_date, end_date):

    data = get_date_range_report(start_date, end_date)

    return jsonify(data), 200