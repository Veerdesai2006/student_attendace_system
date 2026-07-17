from flask import Blueprint, jsonify, request

from class_ops import (
    get_all_classes,
    get_class_by_id,
    add_class_record,
    update_class_record,
    delete_class_record
)

class_bp = Blueprint("class_bp", __name__)


# -------------------------
# GET ALL CLASSES
# -------------------------

@class_bp.route("/api/classes", methods=["GET"])
def get_classes():

    classes = get_all_classes()

    return jsonify(classes), 200


# -------------------------
# GET ONE CLASS
# -------------------------

@class_bp.route("/api/classes/<int:class_id>", methods=["GET"])
def get_class(class_id):

    class_item = get_class_by_id(class_id)

    if class_item is None:
        return jsonify({
            "message": "Class not found"
        }), 404

    return jsonify(class_item), 200


# -------------------------
# ADD CLASS
# -------------------------

@class_bp.route("/api/classes", methods=["POST"])
def add_class():

    data = request.get_json()

    class_item = add_class_record(
        data["class_name"],
        data["division"]
    )

    return jsonify(class_item), 201


# -------------------------
# UPDATE CLASS
# -------------------------

@class_bp.route("/api/classes/<int:class_id>", methods=["PUT"])
def update_class(class_id):

    data = request.get_json()

    updated = update_class_record(
        class_id,
        data["class_name"],
        data["division"]
    )

    if updated is False:
        return jsonify({
            "message": "Class not found"
        }), 404

    return jsonify({
        "message": "Class updated successfully"
    }), 200


# -------------------------
# DELETE CLASS
# -------------------------

@class_bp.route("/api/classes/<int:class_id>", methods=["DELETE"])
def delete_class(class_id):

    deleted = delete_class_record(class_id)

    if deleted is False:
        return jsonify({
            "message": "Class not found"
        }), 404

    return jsonify({
        "message": "Class deleted successfully"
    }), 200