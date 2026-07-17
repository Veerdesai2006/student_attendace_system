from flask import Flask
from flask_cors import CORS

from api.routes.student_routes import student_bp
from api.routes.class_routes import class_bp
from api.routes.subject_routes import subject_bp
from api.routes.teacher_routes import teacher_bp
from api.routes.attendance_routes import attendance_bp
from api.routes.search_routes import search_bp
from api.routes.dashboard_routes import dashboard_bp
from api.routes.report_routes import report_bp
from api.routes.export_routes import export_bp
app = Flask(__name__)

CORS(app)

app.register_blueprint(student_bp)
app.register_blueprint(class_bp)
app.register_blueprint(subject_bp)
app.register_blueprint(teacher_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(search_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(report_bp)
app.register_blueprint(export_bp)

@app.route("/")
def home():

    return {
        "message": "Student Attendance API Running"
    }


if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )