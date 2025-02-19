import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Link } from '@mui/material';
import { styled } from '@mui/system';
import { auth } from 'firebase.ts';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import axios from 'axios';
// Styled title text (We are done!)
const TitleText = styled(Typography)(({ theme }) => ({
  fontSize: '25px',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  textAlign: 'center',
  marginBottom: '35px',
  lineHeight: '26px',
}));

const ParagraphText = styled(Typography)(() => ({
  fontSize: '16px',
  color: '#0D0D0D',
  textAlign: 'center',
  lineHeight: '26px',
}));

const InfoBox = styled(Paper)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px 20px',
  backgroundColor: '#F5F5F5',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 'semibold',
  textAlign: 'center',
  color: '#0D0D0D',
  width: '457px',
  minWidth: '457px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}));

const StyledLink = styled(Link)(() => ({
  fontSize: '16px',
  color: '#0D0D0D',
  textDecoration: 'underline',
  display: 'block',
  lineHeight: '26px',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

interface QuestionnaireProps {        
  pId?: string | null; // Allow projectId to be optional
}

const OutputStage: React.FC<QuestionnaireProps> = ({ pId }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [wait, setWait] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  
  useEffect(() => {
    // Track authenticated user state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user); // User is signed in
      } else {
        setUser(null); // User is signed out
        navigate('/auth/signin'); // Redirect to sign-in if user is not authenticated
      }
    });
    return () => unsubscribe();
  }, [navigate]);

//   const downloadExcel = async () => {
//     if (user) {
//       const uid = user.uid;
//       const projectId = pId;
//       setWait(true);

//       try {
//         const response = await fetch(
//           `http://172.20.10.2:5000/generate-excel?uid=${uid}&project_id=${projectId}`,
//         );

//         if (response.ok) {
//           const blob = await response.blob();
//           const url = window.URL.createObjectURL(blob);
//           const link = document.createElement('a');
//           link.href = url;
//           link.setAttribute('download', 'generated_excel.xlsx');
//           document.body.appendChild(link);
//           link.click();
//           link.remove();
//         } else {
//           console.error('Error downloading the file:', await response.json());
//           console.log(user, pId);
//         }
//       } catch (error) {
//         console.error('Error:', error);
//       }
//       setWait(false);
//     }
//   };



// const downloadReportAsPDF = async () => {
//   if (user) {
//     const uid = user.uid;
//     const projectId = pId;
//     setProcessing(true);

//     try {
//       console.log(uid, "\n", projectId);
//       // Fetch the Excel file
//       const response = await fetch(
//         `http://172.20.10.2:5000/download-report-pdf?uid=${uid}&project_id=${projectId}`
//       );
//       if (response.ok) {
//         const blob = await response.blob();

//         // Read the Excel file
//         const fileReader = new FileReader();
//         fileReader.onload = async (event) => {
//           const data = new Uint8Array(event.target.result);
//           const workbook = XLSX.read(data, { type: "array" });

//           // Check if the "Report" sheet exists
//           const sheetName = "Report";
//           if (workbook.SheetNames.includes(sheetName)) {
//             const sheet = workbook.Sheets[sheetName];
//             const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

//             // Convert the sheet data to a PDF
//             const pdf = new jsPDF();
//             sheetData.forEach((row, rowIndex) => {
//               row.forEach((cell, cellIndex) => {
//                 pdf.text(`${cell || ""}`, 10 + cellIndex * 40, 10 + rowIndex * 10);
//               });
//             });

//             // Save the PDF
//             pdf.save("report.pdf");
//           } else {
//             console.error(`Sheet "${sheetName}" not found.`);
//           }
//         };

//         fileReader.readAsArrayBuffer(blob);
//       } else {
//         console.error("Error downloading the file:", await response.json());
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     }

//     setProcessing(false);
//   }
// };

const handleRemoveFormulas = async () => {
  try {
    console.log(`http://localhost:5000/remove-formula-custom?uid=${user.uid}&project_id=${pId}`);
    const response = await axios.get(
      `http://localhost:5000/remove-formula-custom?uid=${user.uid}&project_id=${pId}`,
      {
        responseType: "blob", // Important to receive files
      }
    );

    // Create a downloadable link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "no_formulas.xlsx"); 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error removing formulas:", error);
  }
};

// Convert Excel to PDF and Upload to Firebase
const handleConvertToPdf = async () => {
  console.log(`http://localhost:5000/convert-to-pdf-custom?uid=${user.uid}&project_id=${pId}`)
  try {
    const response = await axios.get(
      `http://localhost:5000/convert-to-pdf-custom?uid=${user.uid}&project_id=${pId}`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "converted.pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error converting to PDF:", error);
  }
};


  return (
    <Box sx={{ padding: '20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
      {/* Title */}
      <TitleText>We are done!</TitleText>

      {/* Descriptive Text */}
      <ParagraphText>
        Good job there! You have completed the first step towards your self-valuation exercise, by
        successfully fulfilling all our initial data requests.
      </ParagraphText>

      <img
        src="/arrowbroken-up.svg"
        alt="Arrow broken-up"
        style={{ margin: '10px auto', width: '24px', height: '24px' }}
      />

      <ParagraphText>
        The ball now lies with us. Our expert team will conduct a curated analysis of comparable
        companies. A list of these companies will be shared with you for review and approval.
      </ParagraphText>

      <img
        src="/arrowbroken-up.svg"
        alt="Arrow broken-up"
        style={{ margin: '10px auto', width: '24px', height: '24px' }}
      />

      <ParagraphText>
        This won’t take too long. Sit back and relax while we are building this up. Once we are
        done, you will be notified on your project dashboard with the next steps!
      </ParagraphText>

      <img
        src="/arrowbroken-up.svg"
        alt="Arrow broken-up"
        style={{ margin: '10px auto', width: '24px', height: '24px' }}
      />

      {/* Info Boxes */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          margin: '0 auto',
          width: '100%',
          maxWidth: '914px',
          fontWeight: '400',
        }}
      >
        <InfoBox>Waiting period: 24 hours</InfoBox>
        <InfoBox>Estimated time to project completion: 48 Hours</InfoBox>
      </Box>

      {/* Info Boxes */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          margin: '0 auto',
          width: '100%',
          maxWidth: '914px',
          fontWeight: '400',
          marginTop: '18px',
          color: 'primary.main',
        }}
      >
        <InfoBox
          onClick={handleRemoveFormulas}
          sx={{ backgroundColor: 'primary.main', cursor: 'pointer' }}
        >
          {!wait ? 'Download Excel' : 'Downloading your Excel... Please wait!'}
        </InfoBox>
        <InfoBox
         onClick={handleConvertToPdf}
          sx={{ backgroundColor: 'primary.main', cursor: 'pointer' }}
        >
          {!processing ? 'Download PDF' : 'Downloading your PDF... Please wait!'}
        </InfoBox>
      </Box>

      {/* Links Section */}
      {/* <ParagraphText sx={{ mt: 5, mb: 1 }}>
        In the meanwhile, please check these links out:
      </ParagraphText>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginTop: '25px',
        }}
      >
        <StyledLink href="#">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </StyledLink>
        <StyledLink href="#">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </StyledLink> */}
      {/* </Box> */}
    </Box>
  );
};

export default OutputStage;
