import { Button, Typography, Box
       ,  Paper, Snackbar, Alert, CircularProgress 
       } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { auth, firestore, doc, setDoc } from 'firebase.ts';
import { User } from 'firebase/auth';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { storage } from 'firebase.ts';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from 'axios';
import ExcelDownloader from "../../../../../service/ExcelDownloader.js";


export default function ReviewStage() {
  const { projectId: urlProjectId } = useParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = "http://127.0.0.1:5000";
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [user, setUser] = useState<User | null>(null);
  const hash = window.location.hash;
  
  // Extract the parameters from the hash
  const [base, projectId, userId] = hash.split("/").slice(1)

  const handleDownload = async () => {
    await downloadExcel();
    console.log('Download clicked');
  };


  const handleTemplateDownload = () => {
    // Path to the file in the public folder
    const fileUrl = '/peer-comps.xlsx';

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'peer-comps.xlsx'; // Specify the file name for download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
    });
    return () => unsubscribe();
  }, [urlProjectId]);

  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;
  
    const file = files[0];
    setSelectedFile(file); // ✅ Ensure selectedFile is updated first
  
    if (!projectId) {
      setSnackbar({
        open: true,
        message: 'Please ensure a project is selected',
        severity: 'error',
      });
      return;
    }
  
    setLoading(true);
  
    try {
      
      await handleRemoveFormulas(file);
      await handleConvertToPdf(file);
    } catch (error) {
      console.error('Upload error:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error uploading file',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleNextClick = () => {

    navigate(`/#myprojects/${projectId}/user/${userId}/marketAnalysis`, {
      state: { projectId: projectId, userId: userId  
             }
    });
  };

  const uploadToFirebase = async (file, filename) => {
    const fileRef = ref(storage, `processed/${filename}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  // const handleRemoveFormulas = async () => {
  //   if (!selectedFile) return alert("Please select a file.");
  //   const formData = new FormData();
  //   formData.append("file", selectedFile);

  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/remove-formulas`, formData, {
  //       responseType: "blob",
  //     });

  //     // Upload to Firebase Storage
  //     const file = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  //     const fileUrl = await uploadToFirebase(file, `cleaned_excel_${Date.now()}.xlsx`);

  //     setDownloadUrl(fileUrl);
  //     alert("File uploaded successfully! Download URL is available.");
  //   } catch (error) {
  //     console.error("Error removing formulas:", error);
  //   }
  // };

  // // Convert Excel to PDF and Upload to Firebase
  // const handleConvertToPdf = async () => {
  //   if (!selectedFile) return alert("Please select a file.");
  //   const formData = new FormData();
  //   formData.append("file", selectedFile);


// ######################Route#####################################

  // https://flask-hello-world-one-phi-37.vercel.app/generate-excel


  //################################################################
  
  
  
  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/convert-to-pdf`, formData, {
  //       responseType: "blob",
  //     });

  //     // Upload to Firebase Storage
  //     const file = new Blob([response.data], { type: "application/pdf" });
  //     const fileUrl = await uploadToFirebase(file, `converted_pdf_${Date.now()}.pdf`);

  //     setDownloadUrl(fileUrl);
  //     alert("PDF uploaded successfully! Download URL is available.");
  //   } catch (error) {
  //     console.error("Error converting to PDF:", error);
  //   }
  // };

  const handleRemoveFormulas = async (file: File) => {
    if (!file) return alert("Please select a file.");
    if (!userId || !projectId) return alert("User or Project ID missing.");
  
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(`${API_BASE_URL}/remove-formulas`, formData, {
        responseType: "blob",
      });
  
      const processedFile = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const fileUrl = await uploadToFirebase(processedFile, `users/${userId}/projects/${projectId}/cleaned_excel_${Date.now()}.xlsx`);
      
      console.log("Uploaded file URL:", fileUrl);
  
      const docRef = doc(firestore, "users", userId, "projects", projectId);
      await setDoc(docRef, { cleanedExcelUrl: fileUrl }, { merge: true });
  
      alert("Excel file cleaned and uploaded successfully!");
    } catch (error) {
      console.error("Error removing formulas:", error);
    }
  };
  
  
  const handleConvertToPdf = async (file: File) => {
    if (!file) return alert("Please select a file.");
    if (!userId || !projectId) return alert("User or Project ID missing.");
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/convert-to-pdf`, formData, {
        responseType: "blob",
      });
  
      const pdfFile = new Blob([response.data], { type: "application/pdf" });
      const fileUrl = await uploadToFirebase(pdfFile, `users/${userId}/projects/${projectId}/converted_pdf_${Date.now()}.pdf`);
      
      console.log("Uploaded PDF URL:", fileUrl);
  
      const docRef = doc(firestore, "users", userId, "projects", projectId);
      await setDoc(docRef, { convertedPdfUrl: fileUrl }, { merge: true });
  
      alert("PDF file converted and uploaded successfully!");
    } catch (error) {
      console.error("Error converting to PDF:", error);
    }
  };
  
  

  const handleGenerateExcel = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/generate-excel?uid=${userId}&project_id=${base}`, 
        { method: "GET" }
      );
  
      if (!response.ok) {
        throw new Error("Failed to generate Excel file");
      }
  
      // Convert response to a Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      // Create a download link
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated_excel_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      // Revoke the blob URL to free memory
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Failed to generate Excel file.");
    }
  };
  

  return (
    <>
   

    <Paper
      elevation={0}
      sx={{
        bgcolor: '#C1E5E980',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 2,
        border: '1px solid #65B5BE',
        marginBottom: '12px'
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        gutterBottom
        sx={{ mt: 2, color: '#0D0D0D', fontSize: '20px', fontWeight: '600' }}
      >
        Download client data
      </Typography>
      <Typography
        variant="body2"
        align="center"
        sx={{ mt: 1, mb: 6, color: '#252525', fontSize: '14px' }}
      >
        </Typography>
      <Button
        variant="contained"
        onClick={handleGenerateExcel}
        startIcon={
          processing ? (
            <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
          ) : (
            <img src="/arrowbroken-up.svg" alt="Excel Icon" style={{ width: 20, height: 20 }} />
          )
          
        }
        sx={{
          bgcolor: '#51D3E1',
          width: '342px',
          height: '50px',
          '&:hover': {
            bgcolor: '#51D3E1',
          },
          fontSize: '16px',
        }}
      >
          {processing ? 'Downloading...' : 'Download Excel File'}
        
      </Button>
    </Paper>
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#C1E5E980',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          border: '1px solid #65B5BE',
        }}
      >
        {!projectId && (
          <Alert severity="warning" sx={{ mb: 2, width: '100%' }}>
            No project selected. Please select a project first.
          </Alert>
        )}

        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ mt: 2, color: '#0D0D0D', fontSize: '20px', fontWeight: '600' }}
        >
          Upload client data
        </Typography>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || !projectId}
          sx={{
            width: '342px',
            fontSize: '16px',
            padding: '8px 24px',
            backgroundColor: '#f5f5f5',
            borderColor: '#333',
            color: '#333',
            textTransform: 'none',
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ mr: 1 }} />
          ) : (
            <img src="/folder.png" alt="Upload" style={{ marginRight: '12px' }} />
          )}
          {loading ? 'Uploading...' : 'Upload File'}
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
        />
        {/* download link */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            justifyContent: "center",
            marginLeft: "-350px",
          }}
        >
          <Typography
            sx={{
              textTransform: "none",
              fontSize: "16px",
              padding: "8px 24px",
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              color: "#333",
              marginLeft: {
                xs: "0px",
                md: "360px",
              },
              justifyContent: {
                xs: "flex-start",
                md: "center",
              },
              position: "relative",
              zIndex: 100,
              cursor: "pointer",
            }}
          >
            <span onClick={handleTemplateDownload}
              style={{
                color: "#007BFF",
                textDecoration: "underline",
              }}
            >
              Click here
            </span>
            &nbsp;to download Valfiy Peer Comps Template
          </Typography>
        </div>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
      
      <Box
  sx={{
    display: 'flex',
    justifyContent: 'flex-end',
    mb: 2,
    mt:3 // Add some margin below if needed
  }}
>
  <Button
     variant="outlined"
    onClick={handleNextClick}
    sx={{
      borderColor: '#51D3E1', // Custom border color
      color: '#51D3E1',
      // width: '342px',
      height: '50px',
      '&:hover': {
        borderColor: '#51D3E1', // Keep the border color consistent on hover
        backgroundColor: '#51D3E1',
        color: '#fff'
      },
      fontSize: '16px',
    }}
  >
    Next
  </Button>
</Box>
    </>

  );
}