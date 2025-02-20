import { useNavigate, useLocation } from 'react-router-dom';
navigate('#myprojects');
const navigate = useNavigate();
const location = useLocation();
navigate(`#newproject/${projectId}/general`);