import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { collection, getDocs, query } from 'firebase/firestore';
import { auth, firestore } from 'firebase.ts';

interface Project {
  projectStage: string;
  completionDate: string;
}

const LandingAdmin: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<{ [key: string]: number }>({});
  const [completionStats, setCompletionStats] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const usersRef = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const userIds = usersSnapshot.docs.map(doc => doc.id); // Get all user IDs
  
        let allProjects: Project[] = [];
        let monthly: { [key: string]: number } = {};
        let completion: { [key: string]: number } = {};
  
        for (const userId of userIds) {
          console.log(userId);  
          const projectsRef = collection(firestore, 'users', userId, 'projects');
          const projectsSnapshot = await getDocs(projectsRef);
          const userProjects = projectsSnapshot.docs.map(doc => doc.data() as Project);
          
          allProjects = [...allProjects, ...userProjects];
  
          // Process monthly stats
          userProjects.forEach(project => {
            const month = new Date(project.completionDate).toLocaleString('default', { month: 'short' });
            monthly[month] = (monthly[month] || 0) + 1;
            completion[project.projectStage] = (completion[project.projectStage] || 0) + 1;
          });
        }
  
        setProjects(allProjects);
        setMonthlyStats(monthly);
        setCompletionStats(completion);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
  
    fetchAllProjects();
  }, []);
  

  const barChartOptions = {
    xAxis: {
      type: 'category',
      data: Object.keys(monthlyStats),
    },
    yAxis: { type: 'value' },
    series: [{
      data: Object.values(monthlyStats),
      type: 'bar',
      itemStyle: { borderRadius: [10, 10, 0, 0] },
      barWidth: '30%',
      color: '#D9A44B',
    }]
  };

  const lineChartOptions = {
    xAxis: {
      type: 'category',
      data: Object.keys(monthlyStats),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Open Projects',
        data: Object.values(completionStats).filter((_, i) => i < 6),
        type: 'line',
        smooth: true,
        color: '#86CBB3',
      },
      {
        name: 'Completed Projects',
        data: Object.values(completionStats).filter((_, i) => i >= 6),
        type: 'line',
        smooth: true,
        color: '#D9A44B',
      }
    ]
  };

  return (
    <Box p={4}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CardMedia
                component="img"
                image="/openproject.png"
                alt="Open Projects"
                sx={{ height: 40, width: 40, objectFit: 'contain', mr: 2 }}
              />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h3" sx={{ color: '#333', lineHeight: 1 }}>
                  {projects.filter(p => p.projectStage === 'Open').length}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#777', lineHeight: 1.2 }}>
                  Open Projects
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CardMedia
                component="img"
                image="/completeproject.png"
                alt="Completed Projects"
                sx={{ height: 40, width: 40, objectFit: 'contain', mr: 2 }}
              />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h3" sx={{ color: '#333', lineHeight: 1 }}>
                  {projects.filter(p => p.projectStage === 'Completed').length}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#777', lineHeight: 1.2 }}>
                  Completed Projects
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CardMedia
                component="img"
                image="/completeproject.png"
                alt="Total Projects"
                sx={{ height: 40, width: 40, objectFit: 'contain', mr: 2 }}
              />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h3" sx={{ color: '#333', lineHeight: 1 }}>
                  {projects.length}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#777', lineHeight: 1.2 }}>
                  Total Projects
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="h6">Monthly Projects</Typography>
                <Typography variant="body2" sx={{ color: '#888' }}>Last 6 Months</Typography>
              </Box>
              <ReactECharts option={barChartOptions} style={{ height: 300 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="h6">Project Status Trends</Typography>
                <Typography variant="body2" sx={{ color: '#888' }}>Last 6 Months</Typography>
              </Box>
              <ReactECharts option={lineChartOptions} style={{ height: 300 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LandingAdmin;