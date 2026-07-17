from flask import Blueprint, send_file

from export_csv import export_attendance_csv_file

export_bp = Blueprint("export_bp", __name__)


@export_bp.route("/api/export/attendance", methods=["GET"])
def export_attendance():

    filename = export_attendance_csv_file()

    return send_file(
        filename,
        as_attachment=True,
        download_name="attendance.csv",
        mimetype="text/csv"
    )