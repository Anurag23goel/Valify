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
  FormControl,
  MenuItem,
  Select,
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
  extra?: string;
}
interface DynamicTablesProps {
  pId?: string | null;
}

const RevenueTables: React.FC<DynamicTablesProps> = ({ pId, answers, setAnswers }) => {
  const rowTable = [
    {
      type: 'table',
      question: 'EXISTING BUSINESS REVENUES - Price x Volume',
      extra: `Prices are often difficult to forecast. The intention here is to ascertain a long-term sustainable average. However, if you are unable to determine specific price levels, we recommend opting for "Forecast using Price Growth".`,
      questionName: `Price or Average revenue per unit in ${answers['presentationCurrency']}`,
      id: 'existingStreamsPrice',
      depends: 'existingBusinessRevenues',
      rows: [
        {
          label: 'Existing Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      tableNumber: '1',
    },
    {
      type: 'table',
      question: ' ',
      questionName: 'Price Growth',
      id: 'existingStreamsVolume',
      depends: 'existingBusinessRevenues',
      rows: [
        {
          label: 'Existing Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      autoCalculate: '1',
    },
    {
      type: 'table',
      question: ' ',
      questionName: 'Expected sales volumes',
      id: 'existingStreamsPriceGrowth',
      depends: 'existingBusinessRevenues',
      rows: [
        {
          label: 'Existing Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      subheader: 'Volumes',
      extra:`Sales volumes can be difficult to forecast. The intention here is to ascertain a long-term sustainable average. However, if you are unable to determine volume levels, we recommend opting for the below "Volume Growth approach".`,
      ignore: true,
      tableNumber: '2',
    },
    {
      type: 'table',
      question: ' ',
      questionName: 'Volumes Growth',
      depends: 'existingBusinessRevenues',
      id: 'existingStreamsPriceGrowth',
      rows: [
        {
          label: 'Existing Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      autoCalculate: '2',
    },
    {
      type: 'table',
      question: 'PIPELINE BUSINESS REVENUES - Price x Volume',
      extra: `Prices are often difficult to forecast. The intention here is to ascertain a long-term sustainable average. However, if you are unable to determine specific price levels, we recommend opting for "Forecast using Price Growth".`,
      
      questionName: `Price or Average revenue per unit in ${answers['presentationCurrency']}`,
      id: 'pipelineStreamsPrice',
      depends: 'pipelineBusinessRevenues',
      rows: [
        {
          label: 'Existing Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      subheader: 'Price',
      ignore: true,
      tableNumber: '3',
    },
    {
      type: 'table',
      question: ' ',
      questionName: 'Price Growth',
      depends: 'pipelineBusinessRevenues',
      id: 'pipelineStreamsVolume',
      rows: [
        {
          label: 'Existing Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      autoCalculate: '3',
    },
    {
      type: 'table',
      question: ' ',
      depends: 'pipelineBusinessRevenues',
      questionName: 'Expected sales volumes',
      id: 'existingStreamsRevenueForecast',
      rows: [
        {
          label: 'Existing Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      subheader: 'Volumes',
      extra:`Sales volumes can be difficult to forecast. The intention here is to ascertain a long-term sustainable average. However, if you are unable to determine volume levels, we recommend opting for the below "Volume Growth approach".`,
      
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      tableNumber: '4',
    },
    {
      type: 'table',
      question: ' ',
      questionName: 'Volume Growth',
      id: 'volumeGrowth',
      depends: 'pipelineBusinessRevenues',
      rows: [
        {
          label: 'Existing Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      autoCalculate: '4',
    },
    {
      type: 'table',
      question: 'POTENTIAL BUSINESS REVENUES - Price x Volume',
      extra: `Prices are often difficult to forecast. The intention here is to ascertain a long-term sustainable average. However, if you are unable to determine specific price levels, we recommend opting for "Forecast using Price Growth".`,
      
      questionName: `Price or Average revenue per unit in ${answers['presentationCurrency']}`,
      id: 'pipelineStreamsPrice',
      depends: 'potentialBusinessRevenues',
      rows: [
        {
          label: 'Existing Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      subheader: 'Price',
      ignore: true,
      tableNumber: '5',
    },
    {
      type: 'table',
      question: ' ',
      questionName: 'Price Growth',
      id: 'pipelineStreamsVolume',
      depends: 'potentialBusinessRevenues',
      rows: [
        {
          label: 'Existing Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      autoCalculate: '5',
    },
    {
      type: 'table',
      question: ' ',
      questionName: 'Expected sales volumes',
      id: 'existingStreamsRevenueForecast',
      depends: 'potentialBusinessRevenues',
      rows: [
        {
          label: 'Existing Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      subheader: 'Volumes',
      extra:`Sales volumes can be difficult to forecast. The intention here is to ascertain a long-term sustainable average. However, if you are unable to determine volume levels, we recommend opting for the below "Volume Growth approach".`,
      
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      tableNumber: '6',
    },
    {
      type: 'table',
      question: ' ',
      questionName: 'Volume Growth',
      id: 'volumeGrowth',
      depends: 'potentialBusinessRevenues',
      rows: [
        {
          label: 'Existing Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      autoCalculate: '6',
    },
    {
      type: 'dropdown',
      question: 'Existing Business',
      id: 'existingBusinessOption',
      questionName: 'Please select most appropriate option.',
      options: [
        'I can provide specific revenue estimates for each existing business line',
        'I can only provide consolidated total revenue for existing business.',
      ],
    },
    {
      type: 'table',
      question: '',
      parent:'existingBusinessOption',
      depends: 'I can provide specific revenue estimates for each existing business line',
      questionName: 'Existing Revenue',
      id: 'existingBusinessOptionRevenueTable',
      rows: [
        {
          label: 'Revenue Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Revenue Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Revenue Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Revenue Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
     
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      tableNumber: '7',
    },
    {
      type: 'table',
      question: '',
      questionName: 'Total Existing Revenue (value)',
      parent:'existingBusinessOption',
      id: 'existingBusinessOptionContributionTable',
      depends: 'I can only provide consolidated total revenue for existing business.',
      rows: [
        {
          label: 'Existing Revenue Stream 1 - contribution %',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Revenue Stream 2 - contribution %',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Revenue Stream 3 - contribution %',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Existing Revenue Stream 3 - contribution %',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      columns: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      tableNumber: '8',
    },
    {
      type: 'dropdown',
      question: 'Pipeline Business',
      id: 'pipelineBusinessOption',
      questionName: 'Please select most appropriate option.',
      options: [
        'I can provide specific revenue estimates for each existing business line',
        'I can only provide consolidated total revenue for existing business.',
      ],
    },
    {
      type: 'table',
      question: '',
      parent:'pipelineBusinessOption',
      depends: 'I can provide specific revenue estimates for each existing business line',
      questionName: 'Existing Revenue',
      id: 'pipelineBusinessOptionRevenueTable',
      rows: [
        {
          label: 'Pipeline Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Pipeline Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Pipeline Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Pipeline Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
     
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      tableNumber: '9',
    },
    {
      type: 'table',
      question: '',
      questionName: 'Total Pipeline Revenues (value)',
      parent:'pipelineBusinessOption',
      id: 'pipelineBusinessOptionContributionTable',
      depends: 'I can only provide consolidated total revenue for existing business.',
      rows: [
        {
          label: 'Pipeline Revenue Stream 1 - contribution %',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Pipeline Revenue Stream 2 - contribution %',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Pipeline Revenue Stream 3 - contribution %',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Pipeline Revenue Stream 3 - contribution %',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      columns: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      tableNumber: '10',
    },
    {
      type: 'dropdown',
      question: 'Potential Business',
      id: 'potentialBusinessOption',
      questionName: 'Please select most appropriate option.',
      options: [
        'I can provide specific revenue estimates for each existing business line',
        'I can only provide consolidated total revenue for existing business.',
      ],
    },
    {
      type: 'table',
      question: '',
      parent:'potentialBusinessOption',
      depends: 'I can provide specific revenue estimates for each existing business line',
      questionName: 'Potential Revenue',
      id: 'potentialBusinessOptionRevenueTable',
      rows: [
        {
          label: 'Potential Stream 1',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Potential Stream 2',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Potential Stream 3',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Potential Stream 4',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
     
      columns: ['YTD', 'Current Year', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      tableNumber: '11',
    },
    {
      type: 'table',
      question: '',
      questionName: 'Total Potential Revenues (value)',
      parent:'potentialBusinessOption',
      id: 'pipelineBusinessOptionContributionTable',
      depends: 'I can only provide consolidated total revenue for existing business.',
      rows: [
        {
          label: 'Potential Revenue Stream 1 - contribution %',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Potential Revenue Stream 2 - contribution %',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Potential Revenue Stream 3 - contribution %',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
        {
          label: 'Potential Revenue Stream 3 - contribution %',
          values: {
            YTD: '',
            'Current Year': '',
            'Year 1': '',
            'Year 2': '',
            'Year 3': '',
            'Year 4': '',
            'Year 5': '',
          },
        },
      ],
      columns: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ignore: true,
      tableNumber: '12',
    },
  ];
  const [tables, setTables] = useState<TableData[]>(rowTable);
  const [user, setUser] = useState<User | null>(null);
  const [projectId, setProjectId] = useState<string | null | undefined>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ans",answers);
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

  const handleChange = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
    console.log(answers);
  };



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
          if (data.tables) {
            setTables(data.tables); // Only update if tables exist
          }
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
    value: string,
  ) => {
    console.log(tableNumber, rowIndex, column, value);
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
        const autoCalcTable = updatedTables.find((table) => table.autoCalculate === tableNumber);

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
        { merge: true },
      );
      console.log('✅ Revenue tables data saved successfully to Firebase!');
    } catch (error) {
      console.error('Error saving data to Firebase:', error);
    }
  };
  return (
    <Box
      sx={{
        marginTop: '40px',
        alignItems: 'center',
        // gap: '20px'
      }}
    >
     {tables.map((table, tableIndex) => {
  if (
    table.type === "dropdown" ||
    answers[table.depends] === "I have price & volume data for existing business lines" ||
    answers[table.parent] === table.depends
  ) {
    return table.type === "dropdown" ? (
      <FormControl fullWidth variant="outlined" key={tableIndex}>
        {table.questionName && (
          <Typography variant="body1" gutterBottom>
            {table.questionName}
          </Typography>
        )}
        <Select
          value={answers[table.id] || ''}
          onChange={(e) => handleChange(table.id, e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Select an option
          </MenuItem>
          {table.options.map((option, optionIndex) => (
            <MenuItem key={optionIndex} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ) : (
      <Box key={tableIndex} mb={4}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ color: '#51D3E1' }}>
            {table.question}
          </Typography>
          {table.subheader && (
            <Typography variant="subtitle1" sx={{ color: '#51D3E1', fontWeight: 'bold' }}>
              {table.subheader}
            </Typography>
          )}
          {table.extra && (
            <Typography variant="subtitle1">
              {table.extra}
            </Typography>
          )}
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#0D0D0D', border: '1px solid #ccc' }}>
                  {table.questionName}
                </TableCell>
                {table.columns.map((col, colIndex) => (
                  <TableCell key={colIndex} sx={{ color: '#0D0D0D', border: '1px solid #ccc' }}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {table.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell sx={{ color: '#0D0D0D', border: '1px solid #ccc' }}>
                    {row.label}
                  </TableCell>
                  {table.columns.map((col, colIndex) => (
                    <TableCell key={colIndex} sx={{ color: '#0D0D0D', border: '1px solid #ccc' }}>
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
                          {
                            handleInputChange(
                              table.tableNumber as string,
                              rowIndex,
                              col,
                              e.target.value,
                            )
                            console.log("Hey PKSs", table, table.tableNumber, rowIndex, col, e.target.value )
                          }
                          }
                          inputProps={{
                            step: 'any',
                            min: 0,
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
    );
  }
  return null;
})}
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
