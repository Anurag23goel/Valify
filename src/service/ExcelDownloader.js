import { getFirestore, doc, getDoc } from "firebase/firestore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { firestore } from "./firebase.ts";

class ExcelDownloader {
  constructor(userId, projectId) {
    this.userId = userId;
    this.projectId = projectId;
  }

  async fetchDataFromFirestore() {
    try {
      const docRef = doc(firestore, "users", this.userId, "projects", this.projectId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("No document found!");
      }

      return docSnap.data().answers || {};
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error("Failed to fetch data from Firestore.");
    }
  }

  async generateExcel() {
    try {
      const data = await this.fetchDataFromFirestore();
      console.log("Fetched Data:", data);

      // Load the Excel template
      const response = await fetch("/dynamic_excel.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array", cellStyles: true });

      // Define JSON to Excel cell mapping
      const jsonToExcelMapping = {
        Inputs: {
          valuerType: "E18",
          clientName: "E19",
          valuerName: "E20",
          purpose: "E21",
          premise: "E22",
          draftNote: "E23",
          projectTitle: "E26",
          subjectCompanyName: "E24",
          shortName: "E25",
          nextFiscalYearEndDate: "E30",
          valuationDate: "E29",
          ytd: "E33",
        },
      };

      // Get the worksheet
      const sheetName = "Inputs"; // Adjust as per your sheet name
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        throw new Error(`Worksheet "${sheetName}" not found in the template.`);
      }

      // Update values without modifying styles
      for (const field in jsonToExcelMapping.Inputs) {
        const cellAddress = jsonToExcelMapping.Inputs[field];
        if (data[field]) {
          if (!worksheet[cellAddress]) worksheet[cellAddress] = {}; // Ensure the cell exists
          worksheet[cellAddress].v = data[field]; // Only update the value
        }
      }

      // Generate new Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
        cellStyles: true, // Preserve styles
      });

      // Save the updated file
      const fileName = `final_invoice_${Date.now()}.xlsx`;
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Error generating Excel file");
    }
  }
}

export default ExcelDownloader;
