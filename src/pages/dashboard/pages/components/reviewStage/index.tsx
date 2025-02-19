import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { auth } from 'firebase'; // Adjust import path based on your file structure
import { firestore as db, doc, getDoc, setDoc } from 'firebase'; // Firestore imports
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

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

const formatTime = (ms) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const ReviewStage = ({ pId }) => {
  const [processing, setProcessing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isPast, setIsPast] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        navigate('/auth/signin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchOrCreateExpectedDate = async () => {
      console.log(pId);
      if (!user || !pId) return;

      const projectDocRef = doc(db, `users/${user.uid}/projects/${pId}`);
      const projectDoc = await getDoc(projectDocRef);
      let expectedDate;
  
      if (projectDoc.exists() && projectDoc.data().expectedDate) {
        expectedDate = projectDoc.data().expectedDate;
        console.log(expectedDate);
      } else {
        expectedDate = dayjs().add(72, 'hours').toISOString();
        await setDoc(projectDocRef, { expectedDate }, { merge: true });
        console.log("Setting the expectedDate");
      }

      const updateTimer = () => {
        const now = dayjs();
        const targetDate = dayjs(expectedDate);
        const difference = targetDate.diff(now);

        if (difference < 0) {
          setIsPast(true);
          setMessage('It is taking longer than expected.');
        } else {
          setIsPast(false);
          setMessage('');
        }

        setTimeLeft(formatTime(Math.abs(difference)));
      };

      updateTimer();
      const intervalId = setInterval(updateTimer, 1000);

      return () => clearInterval(intervalId);
    };

    fetchOrCreateExpectedDate();
    setProcessing(false);
  }, [user, pId]);

  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
     {processing ?  (<div></div>) : (
      <div>
       {/* Title Text */}
       <Typography
       variant="h6"
       sx={{
         color: '#51D3E1',
         fontWeight: 'bold',
         fontSize: '25px',
         mb: 3,
       }}
     >
       We are Currently reviewing on our side!
     </Typography>

     {/* Subheading Text */}
     <Typography
       variant="body2"
       sx={{
         color: '#0D0D0D',
         fontSize: '22px',
         mb: 7,
       }}
     >
       {isPast ? message : 'It will take approximately this much time for us to review'}
     </Typography>

     {/* Timer Box */}
     <TimerBox>
       <Typography
         variant="h4"
         sx={{
           fontFamily: 'monospace',
           fontSize: '40px',
           color: isPast ? '#000000' : '#000000',
           marginTop: '20px',
           marginBottom: '32px',
         }}
       >
         {isPast ? `+${timeLeft}` : `-${timeLeft}`}
       </Typography>
     </TimerBox>
     </div>
     ) }
    </Box>
  );
};

export default ReviewStage;
