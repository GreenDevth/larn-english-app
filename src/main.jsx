import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import Papa from 'papaparse';

export const parseCSV = async (filePath) => {
  const response = await fetch(filePath);
  const data = await response.text();
  const parsedData = Papa.parse(data, {
    header: true,
    skipEmptyLines: true,
  });
  return parsedData.data;
};

// Example usage
parseCSV('/public/vocab.csv').then((data) => {
  console.log(data);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
