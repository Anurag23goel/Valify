from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import os
import json
from datetime import datetime
from openpyxl import load_workbook
from pycel.excelcompiler import ExcelCompiler
import firebase_admin
from firebase_admin import credentials, firestore, storage

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase Admin SDK
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cred = credentials.Certificate(os.path.join(BASE_DIR, "serviceAccountKey.json"))
firebase_admin.initialize_app(cred, {"storageBucket": "valify-7e530.appspot.com"})

# Initialize Firestore DB
db = firestore.client()

# Define template path
TEMPLATE_PATH = os.path.join(BASE_DIR, "latest.xlsm")


# JSON to Excel mapping
json_to_excel_mapping = {
  "CashasatValuationDate": "E257",
  "CurrentAssets_0_0": "L232",
  "CurrentAssets_0_1": "M232",
  "CurrentAssets_0_2": "N232",
  "CurrentAssets_0_3": "O232",
  "CurrentAssets_0_4": "P232",
  "CurrentAssets_0_5": "Q232",
  "CurrentAssets_1_0": "L233",
  "CurrentAssets_1_1": "M233",
  "CurrentAssets_1_2": "N233",
  "CurrentAssets_1_3": "O233",
  "CurrentAssets_1_4": "P233",
  "CurrentAssets_1_5": "Q233",
  "CurrentAssets_2_0": "L234",
  "CurrentAssets_2_1": "M234",
  "CurrentAssets_2_2": "N234",
  "CurrentAssets_2_3": "O234",
  "CurrentAssets_2_4": "P234",
  "CurrentAssets_2_5": "Q234",
  "CurrentAssets_3_0": "L235",
  "CurrentAssets_3_1": "M235",
  "CurrentAssets_3_2": "N235",
  "CurrentAssets_3_3": "O235",
  "CurrentAssets_3_4": "P235",
  "CurrentAssets_3_5": "Q235",
  "Cyclicality": "E279",
  "PenetrationRisk": "E275",
  "VendorRisk": "E276",
  "avgAnnualRevenue": "E49",
  "clientName": "E19",
  "currentLiabilities_0_0": "L237",
  "currentLiabilities_0_1": "M237",
  "currentLiabilities_0_2": "N237",
  "currentLiabilities_0_3": "O237",
  "currentLiabilities_0_4": "P237",
  "currentLiabilities_0_5": "Q237",
  "currentLiabilities_1_0": "L238",
  "currentLiabilities_1_1": "M238",
  "currentLiabilities_1_2": "N238",
  "currentLiabilities_1_3": "O238",
  "currentLiabilities_1_4": "P238",
  "currentLiabilities_1_5": "Q238",
  "currentLiabilities_2_0": "L239",
  "currentLiabilities_2_1": "M239",
  "currentLiabilities_2_2": "N239",
  "currentLiabilities_2_3": "O239",
  "currentLiabilities_2_4": "P239",
  "currentLiabilities_2_5": "Q239",
  "currentLiabilities_3_0": "L240",
  "currentLiabilities_3_1": "M240",
  "currentLiabilities_3_2": "N240",
  "currentLiabilities_3_3": "O240",
  "currentLiabilities_3_4": "P240",
  "currentLiabilities_3_5": "Q240",
  "currentLiabilities_4_0": "L241",
  "currentLiabilities_4_1": "M241",
  "currentLiabilities_4_2": "N241",
  "currentLiabilities_4_3": "O241",
  "currentLiabilities_4_4": "P241",
  "currentLiabilities_4_5": "Q241",
  "developmentPhase": "E50",
  "existingStream1": "E77",
  "existingStream2": "E78",
  "existingStream3": "E79",
  "existingStream4": "E80",
  "existingStreamsGrossMargin_0_0": "L167",
  "existingStreamsGrossMargin_0_1": "M167",
  "existingStreamsGrossMargin_0_2": "N167",
  "existingStreamsGrossMargin_0_3": "O167",
  "existingStreamsGrossMargin_0_4": "P167",
  "existingStreamsGrossMargin_0_5": "Q167",
  "existingStreamsGrossMargin_1_0": "L168",
  "existingStreamsGrossMargin_1_1": "M168",
  "existingStreamsGrossMargin_1_2": "N168",
  "existingStreamsGrossMargin_1_3": "O168",
  "existingStreamsGrossMargin_1_4": "P168",
  "existingStreamsGrossMargin_1_5": "Q168",
  "existingStreamsGrossMargin_2_0": "L169",
  "existingStreamsGrossMargin_2_1": "M169",
  "existingStreamsGrossMargin_2_2": "N169",
  "existingStreamsGrossMargin_2_3": "O169",
  "existingStreamsGrossMargin_2_4": "P169",
  "existingStreamsGrossMargin_2_5": "Q169",
  "existingStreamsGrossMargin_3_0": "L170",
  "existingStreamsGrossMargin_3_1": "M170",
  "existingStreamsGrossMargin_3_2": "N170",
  "existingStreamsGrossMargin_3_3": "O170",
  "existingStreamsGrossMargin_3_4": "P170",
  "existingStreamsGrossMargin_3_5": "Q170",
  "industryPrimaryBusiness": "E52",
  "industrySecondaryBusiness": "E63",
  "informationCurrency": "E43",
  "otherOperatingRegionsSecondaryName1": "D71",
  "otherOperatingRegionsSecondaryName2": "D72",
  "otherOperatingRegionsSecondaryName3": "D73",
  "otherOperatingRegionsSecondaryValue1": "E71",
  "otherOperatingRegionsSecondaryValue2": "E72",
  "otherOperatingRegionsSecondaryValue3": "E73",
  "otherRegionsName1": "D59",
  "otherRegionsName2": "D60",
  "otherRegionsName3": "D61",
  "otherRegionsValue1": "E59",
  "otherRegionsValue2": "E60",
  "otherRegionsValue3": "E61",
  "pipelineStream1": "E82",
  "pipelineStream2": "E83",
  "pipelineStream3": "E84",
  "pipelineStream4": "E85",
  "pipelineStreamsGrossMargin_0_0": "L171",
  "pipelineStreamsGrossMargin_0_1": "M171",
  "pipelineStreamsGrossMargin_0_2": "N171",
  "pipelineStreamsGrossMargin_0_3": "O171",
  "pipelineStreamsGrossMargin_0_4": "P171",
  "pipelineStreamsGrossMargin_0_5": "Q171",
  "pipelineStreamsGrossMargin_1_0": "L172",
  "pipelineStreamsGrossMargin_1_1": "M172",
  "pipelineStreamsGrossMargin_1_2": "N172",
  "pipelineStreamsGrossMargin_1_3": "O172",
  "pipelineStreamsGrossMargin_1_4": "P172",
  "pipelineStreamsGrossMargin_1_5": "Q172",
  "pipelineStreamsGrossMargin_2_0": "L173",
  "pipelineStreamsGrossMargin_2_1": "M173",
  "pipelineStreamsGrossMargin_2_2": "N173",
  "pipelineStreamsGrossMargin_2_3": "O173",
  "pipelineStreamsGrossMargin_2_4": "P173",
  "pipelineStreamsGrossMargin_2_5": "Q173",
  "pipelineStreamsGrossMargin_3_0": "L174",
  "pipelineStreamsGrossMargin_3_1": "M174",
  "pipelineStreamsGrossMargin_3_2": "N174",
  "pipelineStreamsGrossMargin_3_3": "O174",
  "pipelineStreamsGrossMargin_3_4": "P174",
  "pipelineStreamsGrossMargin_3_5": "Q174",
  "potentialStream1": "E87",
  "potentialStream1Probability": "E93",
  "potentialStream2": "E88",
  "potentialStream2Probability": "E94",
  "potentialStream3": "E89",
  "potentialStream3Probability": "E95",
  "potentialStream4": "E90",
  "potentialStream4Probability": "E96",
  "presentationCurrency": "E44",
  "primaryBusiness": "E54",
  "premise": "E22",
  "draftNote": "E23",
  "projectTitle": "E26",
  "primaryBusinessDescription": "E55",
  "primaryRegions": "E56",
  "purpose": "E21",
  "secondaryRegions": "E67",
  "secondaryBusiness": "E65",
  "secondaryBusinessDescription": "E66",
  "shortName": "E25",
  "valuationDate": "E29",
  "nextFiscalYearEndDate": "E30",
  "subindustryPrimaryBusiness": "E53",
  "subindustrySecondaryBusiness": "E64",
  "subjectCompanyName": "E24",
  "units": "E45",
  "valuerName": "E20",
  "valuerType": "E18",
  "ytd": "E33",
  "ytgApproach": "E36"
    
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
