import React, { useEffect, useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { auth, firestore, doc, setDoc, getDoc } from 'firebase.ts';


interface TableRowData {
    label: string;
    values: Record<string, string | number>;
}

interface TableData {
    type: string;
    question: string;
    questionName: string;
    id: string;
    rows: TableRowData[];
    columns: string[];
    ignore?: boolean;
    tableNumber?: string;
    autoCalculate?: string;
    subheader?: string;
}
interface DynamicTablesProps {
    pId?: string | null;
}

const RevenueTables: React.FC<DynamicTablesProps> = ({ pId }) => {
    const [tables, setTables] = useState<TableData[]>([
        {
            type: 'table',
            question: 'EXISTING BUSINESS REVENUES - Price x Volume',
            questionName: 'Price or Average revenue per unit (in information currency)',
            id: 'existingStreamsPrice',
            rows: [
                { label: 'Existing Stream 1', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 2', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 3', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 4', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
            ],
            columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            ignore: true,
            tableNumber: '1'
        },
        {
            type: 'table',
            question: ' ',
            questionName: 'Price Growth',
            id: 'existingStreamsVolume',
            rows: [
                { label: 'Existing Stream 1', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 2', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 3', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 4', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
            ],
            columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            ignore: true,
            autoCalculate: '1'

        },
        {
            type: 'table',
            question: ' ',
            questionName: 'Expected sales volumes',
            id: 'existingStreamsPriceGrowth',
            rows: [
                { label: 'Existing Stream 1', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 2', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 3', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 4', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
            ],
            columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            subheader: 'Volumes',
            ignore: true,
            tableNumber: '2'
        },
        {
            type: 'table',
            question: ' ',
            questionName: 'Volumes Growth',
            id: 'existingStreamsPriceGrowth',
            rows: [
                { label: 'Existing Stream 1', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 2', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 3', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 4', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
            ],
            columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            ignore: true,
            autoCalculate: '2'
        },
        {
            type: 'table',
            question: 'PIPELINE BUSINESS REVENUES - Price x Volume',
            questionName: 'Price or Average revenue per unit (in information currency)',
            id: 'pipelineStreamsPrice',
            rows: [
                { label: 'Existing Stream 1', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 2', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 3', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 4', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
            ],
            columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            subheader: 'Price',
            ignore: true,
            tableNumber: '3'
        },
        {
            type: 'table',
            question: ' ',
            questionName: 'Price Growth',
            id: 'pipelineStreamsVolume',
            rows: [
                { label: 'Existing Stream 1', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 2', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 3', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 4', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
            ],
            columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            ignore: true,
            autoCalculate: '3'
        },
        {
            type: 'table',
            question: ' ',
            questionName: 'Expected sales volumes',
            id: 'existingStreamsRevenueForecast',
            rows: [
                { label: 'Existing Stream 1', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 2', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 3', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 4', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
            ],
            subheader: 'Volumes',
            columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            ignore: true,
            tableNumber: '4'
        },
        {
            type: 'table',
            question: ' ',
            questionName: 'Volume Growth',
            id: 'volumeGrowth',
            rows: [
                { label: 'Existing Stream 1', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 2', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 3', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 4', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
            ],
            columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            ignore: true,
            autoCalculate: '4'
        },
        {
            type: 'table',
            question: 'POTENTIAL BUSINESS REVENUES - Price x Volume',
            questionName: 'Price or Average revenue per unit (in information currency)',
            id: 'pipelineStreamsPrice',
            rows: [
                { label: 'Existing Stream 1', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 2', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 3', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 4', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
            ],
            columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            subheader: 'Price',
            ignore: true,
            tableNumber: '5'
        },
        {
            type: 'table',
            question: ' ',
            questionName: 'Price Growth',
            id: 'pipelineStreamsVolume',
            rows: [
                { label: 'Existing Stream 1', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 2', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 3', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 4', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
            ],
            columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            ignore: true,
            autoCalculate: '5'
        },
        {
            type: 'table',
            question: ' ',
            questionName: 'Expected sales volumes',
            id: 'existingStreamsRevenueForecast',
            rows: [
                { label: 'Existing Stream 1', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 2', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 3', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 4', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
            ],
            subheader: 'Volumes',
            columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            ignore: true,
            tableNumber: '6'
        },
        {
            type: 'table',
            question: ' ',
            questionName: 'Volume Growth',
            id: 'volumeGrowth',
            rows: [
                { label: 'Existing Stream 1', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 2', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 3', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 4', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
            ],
            columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            ignore: true,
            autoCalculate: '6'
        },
        {
            type: 'table',
            question: 'Revenue Contribution % for Existing Streams',
            questionName: 'Existing Streams Contribution Table',
            id: 'existingStreamsContribution',
            rows: [
                { label: 'Existing Stream 1', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 2', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 3', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
                { label: 'Existing Stream 4', values: { YTD: '', 'Current Year': '', 'Year 1': '', 'Year 2': '', 'Year 3': '', 'Year 4': '', 'Year 5': '' } },
            ],
            columns: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            ignore: true,
        },
    ]);
    const [user, setUser] = useState<User | null>(null);
    const [projectId, setProjectId] = useState<string | null | undefined>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                setProjectId(pId);
            } else {
                setUser(null);
                navigate('/auth/signin');
            }
        });
        return () => unsubscribe();
    }, [navigate, pId]);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         if (user && projectId) {
    //             const projectRef = doc(firestore, 'users', user.uid, 'projects', projectId);
    //             try {
    //                 const docSnap = await getDoc(projectRef);
    //                 if (docSnap.exists()) {
    //                     const data = docSnap.data();
    //                     if (data.tables) {
    //                         setTables(data.tables);
    //                     }
    //                 }
    //             } catch (error) {
    //                 console.error('Error fetching data:', error);
    //             }
    //         }
    //     };
    //     fetchData();
    // }, [user, projectId]);
    useEffect(() => {
        const fetchData = async () => {
          if (user && projectId) {
            try {
              const docSnap = await getDoc(doc(firestore, 'users', user.uid, 'projects', projectId));
              if (docSnap.exists()) {
                const data = docSnap.data();
                // setTables(data.tables || []);
              } else {
                console.warn('No document found for the given project ID.');
              }
            } catch (error) {
              console.error('Error fetching table data:', error);
            }
          }
        };
        fetchData();
      }, [user, projectId]);

      
    const handleInputChange = (
        tableNumber: string,
        rowIndex: number,
        column: string,
        value: string
    ) => {
        setTables((prevTables) => {
            const updatedTables = [...prevTables];
            const inputTable = updatedTables.find((table) => table.tableNumber === tableNumber);

            if (inputTable) {
                const row = inputTable.rows[rowIndex];
                if (row) {
                    row.values[column] = value;

                    // If the column is YTD, propagate value to all cells in the same row
                    if (column === 'YTD') {
                        inputTable.columns.forEach((col) => {
                            if (col !== 'YTD') {
                                row.values[col] = value;
                            }
                        });
                    }
                }

                // Update corresponding auto-calculated table
                const autoCalcTable = updatedTables.find(
                    (table) => table.autoCalculate === tableNumber
                );

                if (autoCalcTable) {
                    autoCalcTable.rows.forEach((autoRow, index) => {
                        if (index === rowIndex) {
                            autoCalcTable.columns.forEach((col) => {
                                if (col === 'YTD') {
                                    autoRow.values[col] = 'NA';
                                } else {
                                    const currentValue = parseFloat(row.values[col] as string) || 0;
                                    const prevValue =
                                        col === 'Current Year'
                                            ? parseFloat(row.values['YTD'] as string) || 0
                                            : parseFloat(row.values['Current Year'] as string) || 0;

                                    if (prevValue !== 0) {
                                        autoRow.values[col] = `${((currentValue / prevValue - 1) * 100).toFixed(2)}%`;
                                    } else {
                                        autoRow.values[col] = '';
                                    }
                                }
                            });
                        }
                    });
                }
            }
            saveToFirebase(updatedTables);
            return updatedTables;
        });
    };
    const saveToFirebase = async (updatedTables: TableData[]) => {
        if (!user || !projectId) {
            console.error('User is not authenticated or project ID is missing');
            return;
        }

        try {
            const projectRef = doc(firestore, 'users', user.uid, 'projects', projectId);
            await setDoc(
                projectRef,
                {
                    projectId,
                    tables: updatedTables,
                    timestamp: new Date(),
                    userId: user.uid,
                },
                { merge: true }
            );
            console.log('✅ Revenue tables data saved successfully to Firebase!');
        } catch (error) {
            console.error('Error saving data to Firebase:', error);
        }
    };
    return (
        <Box sx={{
            marginTop: '20px',
            // alignItems: 'center',
            // gap: '20px'
        }}>
            {tables.map((table, tableIndex) => (
                <Box key={tableIndex} mb={4}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <Typography variant="h6" sx={{
                            marginLeft: '30px',
                            color: '#51D3E1',
                        }}>{table.questionName}
                        </Typography>
                        {table.subheader && <Typography variant="subtitle1" sx={{ color: '#51D3E1', fontWeight: 'bold' }}>- {table.subheader}</Typography>}
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: '#0D0D0D', border: '1px solid #ccc', width: '200px' }}>{table.questionName}</TableCell>
                                    {table.columns.map((col, colIndex) => (
                                        <TableCell key={colIndex} sx={{ color: '#0D0D0D', border: '1px solid #ccc', }}>{col}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {table.rows.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        <TableCell sx={{ color: '#0D0D0D', border: '1px solid #ccc', }}>{row.label}</TableCell>
                                        {table.columns.map((col, colIndex) => (
                                            <TableCell key={colIndex} sx={{ color: '#0D0D0D', border: '1px solid #ccc', width: '120px' }}>
                                                {table.autoCalculate ? (
                                                    row.values[col]
                                                ) : (
                                                    <TextField
                                                        variant="outlined"
                                                        size="small"
                                                        type="number"
                                                        sx={{
                                                            color: '#0D0D0D',

                                                            '& input[type=number]': {
                                                                '-moz-appearance': 'textfield',
                                                                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                                    '-webkit-appearance': 'none',
                                                                    margin: 0,
                                                                },
                                                            },
                                                        }}
                                                        value={row.values[col] ?? ''}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                table.tableNumber as string,
                                                                rowIndex,
                                                                col,
                                                                e.target.value
                                                            )
                                                        }
                                                        inputProps={{
                                                            step: 'any', // Allows decimal numbers
                                                            min: 0, // Optional: Define a minimum value
                                                        }}
                                                    />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ))}
        </Box>
    );
};

export default RevenueTables;

/* 
The data will be stored in Firestore with this structure:
users/
  {userId}/
    projects/
      {projectId}/
        - projectId: string
        - tables: array of TableData
        - timestamp: date
        - userId: string 
        */