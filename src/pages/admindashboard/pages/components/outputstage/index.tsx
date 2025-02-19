//this page will be blank
import { useNavigate } from 'react-router-dom';
import { Button
       ,  Box 
       } from '@mui/material';

const OutputStage = () => {
  const hash = window.location.hash;
  const navigate = useNavigate();
  const API_BASE_URL = "http://127.0.0.1:5000";
  const [base, projectId, userId] = hash.split("/").slice(1);
  const handlePreviousClick = () => {

    navigate(`/#myprojects/${projectId}/user/${userId}/reviewStage`, {
      state: { projectId: projectId, userId: userId  
             }
    });
    console.log(base);
  };

  const uploadToFirebase = async (file, filename) => {
    const fileRef = ref(storage, `processed/${filename}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const handleRemoveFormulas = async (uid, projectId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/convert-to-pdf?uid=${uid}&project_id=${projectId}`,
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

  // Convert Excel to PDF and Upload to Firebase
  const handleConvertToPdf = async (uid, projectId) => {
    if (!selectedFile) return alert("Please select a file.");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/convert-to-pdf`, formData, {
        responseType: "blob",
      });

      // Upload to Firebase Storage
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileUrl = await uploadToFirebase(file, `converted_pdf_${Date.now()}.pdf`);

      setDownloadUrl(fileUrl);
      alert("PDF uploaded successfully! Download URL is available.");
    } catch (error) {
      console.error("Error converting to PDF:", error);
    }
  };


  const handleGenerateExcel = async () => {
    if (!uid || !idToken) return alert("Please login first.");

    try {
      const response = await axios.get(`${API_BASE_URL}/generate-excel`, {
        params: { userId, project_id: projectId },
        headers: { Authorization: `Bearer ${idToken}` },
        responseType: "blob",
      });

      // Trigger Download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "generated_excel.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error generating Excel:", error);
    }
  };


  return <div>
    <Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between', // Ensure space between buttons
    alignItems: 'center', // Align buttons vertically
    mb: 2, // Add some margin below if needed
  }}
>
  <Button
    variant="outlined"
    onClick={handlePreviousClick}
    sx={{
      borderColor: '#51D3E1', // Custom border color
      color: '#51D3E1',
      height: '50px',
      '&:hover': {
        borderColor: '#51D3E1', // Keep the border color consistent on hover
        backgroundColor: '#51D3E1',
        color: '#fff',
      },
      fontSize: '16px',
    }}
  >
    Previous
  </Button>

 
</Box>
  </div>;
};

export default OutputStage;
