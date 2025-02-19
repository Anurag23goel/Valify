from flask import Flask, request, jsonify
import os
import json
from datetime import datetime
from openpyxl import load_workbook
from pycel.excelcompiler import ExcelCompiler
import firebase_admin
from firebase_admin import credentials, firestore, storage

# Initialize Flask app
app = Flask(__name__)

# Initialize Firebase Admin SDK
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cred = credentials.Certificate(os.path.join(BASE_DIR, "serviceAccountKey.json"))
firebase_admin.initialize_app(cred, {"storageBucket": "valify-7e530.appspot.com"})

# Initialize Firestore DB
db = firestore.client()

# Define template path
TEMPLATE_PATH = os.path.join(BASE_DIR, "latest.xlsm")

# Define a mapping for the JSON structure to Excel cells
json_to_excel_mapping = {
    "Inputs": {
        "valuerType": "E18",
        "clientName": "E19",
        "valuerName": "E20",
        "purpose": "E21",
        "premise": "E22",
        "draftNote": "E23",
        "projectTitle": "E26"
    }
}

@app.route('/generate', methods=['GET'])
def generate_invoice():
    try:
        # Extract UID and project_id from request arguments
        uid = request.args.get("uid")
        project_id = request.args.get("project_id")

        if not uid or not project_id:
            return jsonify({"message": "Missing required parameters."}), 400

        # Fetch Firestore data
        doc_ref = db.collection("users").document(uid).collection("projects").document(project_id)
        doc = doc_ref.get()

        if not doc.exists:
            return jsonify({"message": "Document not found."}), 404

        data = doc.to_dict().get("answers", {})

        # Load the Excel template
        workbook = load_workbook(TEMPLATE_PATH, keep_vba=True)

        # Update the Excel sheet with Firestore data
        for sheet_name, field_map in json_to_excel_mapping.items():
            worksheet = workbook[sheet_name]
            for field, cell_location in field_map.items():
                value = data.get(field, None)
                if value is not None:
                    worksheet[cell_location].value = value

        # Save the file to a temporary directory
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"/tmp/final_invoice_{timestamp}.xlsm"
        workbook.save(output_filename)

        # Upload the file to Firebase Storage
        bucket = storage.bucket()
        blob = bucket.blob(f"invoices/final_invoice_{timestamp}.xlsm")
        blob.upload_from_filename(output_filename)
        blob.make_public()

        # Generate a download URL
        download_url = blob.public_url

        return jsonify({"download_url": download_url}), 200

    except Exception as e:
        return jsonify({"message": "Error generating Excel file.", "error": str(e)}), 500

# WSGI application entry point
application = app