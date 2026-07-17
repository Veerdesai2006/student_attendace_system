from flask import Blueprint, jsonify

from dashboard import get_dashboard_data

dashboard_bp = Blueprint("dashboard_bp", __name__)


@dashboard_bp.route("/api/dashboard", methods=["GET"])
def dashboard():

    data = get_dashboard_data()

    return jsonify(data), 200