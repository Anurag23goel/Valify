import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore as db } from 'firebase';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
// Styled component for the timer box
const TimerBox = styled(Box)({
  backgroundColor: '#F5F5F5',
  padding: '20px',
  borderRadius: '10px',
  textAlign: 'center',
  width: '100%',
  maxWidth: '800px',
  margin: '20px auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '119px',
});


const AdminReviewStage: React.FC = ({pId}) => {
  const [expectedDate, setExpectedDate] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [incrementHours, setIncrementHours] = useState<number>(1);
  const hash = window.location.hash;
  const navigate = useNavigate();
  // Extract the parameters from the hash
  const [base, projectId, userId] = hash.split("/").slice(1);

  const handleNextClick = () => {

    navigate(`/#myprojects/${projectId}/user/${userId}/outputStage`, {
      state: { projectId: projectId, userId: userId  
             }
    });
  };
  const handlePreviousClick = () => {

    navigate(`/#myprojects/${projectId}/user/${userId}/forecastsChecks`, {
      state: { projectId: projectId, userId: userId  
             }
    });
  };


  useEffect(() => {
    const fetchExpectedDate = async () => {
      console.log("Hey PKS", pId, userId);
      const projectDocRef = doc(db, `users/${userId}/projects/${pId}`); // Example path
      const projectDoc = await getDoc(projectDocRef);
  
      if (projectDoc.exists() && projectDoc.data().expectedDate) {
        const date = projectDoc.data().expectedDate;
        setExpectedDate(date);
        updateTimer(date);
      } else {
        const defaultDate = dayjs().add(72, 'hours').toISOString();
        setExpectedDate(defaultDate);
  
        // Add only the expectedDate field while preserving other fields
        await setDoc(projectDocRef, { expectedDate: defaultDate }, { merge: true });
      }
    };
  
    fetchExpectedDate();
  }, []);
  

  useEffect(() => {
    const interval = setInterval(() => {
      if (expectedDate) {
        updateTimer(expectedDate);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expectedDate]);

  const updateTimer = (date: string) => {
    const now = dayjs();
    const targetDate = dayjs(date);
    const difference = targetDate.diff(now);

    if (difference < 0) {
      setTimeLeft(`+${formatTime(Math.abs(difference))}`);
    } else {
      setTimeLeft(`-${formatTime(difference)}`);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const handleIncrementTime = async () => {
    const newDate = dayjs(expectedDate).add(incrementHours, 'hours').toISOString();
    setExpectedDate(newDate);

    const projectDocRef = doc(db, `admin/config`); // Example path
    await setDoc(projectDocRef, { expectedDate: newDate }, { merge: true });
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
       
      <Typography
        variant="h6"
        sx={{
          color: '#51D3E1',
          fontWeight: 'bold',
          fontSize: '25px',
          mb: 3,
        }}
      >
        Update Review Time
      </Typography>

      <TimerBox>
        <Typography
          variant="h4"
          sx={{
            fontWeight: '400',
            fontFamily: 'monospace',
            fontSize: '40px',
            color: '#0D0D0D',
          }}
        >
          {timeLeft}
        </Typography>
      </TimerBox>

      <Box sx={{ mt: 4 }}>
        <TextField
          label="Add Hours"
          type="number"
          value={incrementHours}
          onChange={(e) => setIncrementHours(Number(e.target.value))}
          sx={{ width: '200px', mr: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleIncrementTime}
        >
          Increment Time
        </Button>
      </Box>
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

  <Button
    variant="outlined"
    onClick={handleNextClick}
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
    Next
  </Button>
</Box>
    </Box>
  );
};

export default AdminReviewStage;
