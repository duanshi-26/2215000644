const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const REQUEST_TIMEOUT = 500; // ms

// Middleware
app.use(cors());
app.use(express.json());

// Data storage for each number type
const numberStore = {
  p: [], // prime
  f: [], // fibonacci
  e: [], // even
  r: []  // random
};

// Helper function to calculate average
const calculateAverage = (nums) => {
  if (nums.length === 0) return 0;
  return nums.reduce((sum, num) => sum + num, 0) / nums.length;
};

// Map short IDs to API endpoints
const apiEndpoints = {
  p: 'http://20.244.56.144/evaluation-service/primes',
  f: 'http://20.244.56.144/evaluation-service/fibbo',
  e: 'http://20.244.56.144/evaluation-service/even',
  r: 'http://20.244.56.144/evaluation-service/rand'
};

// Helper function to fetch numbers from external APIs with timeout
const fetchNumbers = async (numberId) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await axios.get(apiEndpoints[numberId], {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.data && Array.isArray(response.data.numbers)) {
      return response.data.numbers;
    }
    return [];
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      console.log(`Request to ${numberId} endpoint timed out after ${REQUEST_TIMEOUT}ms`);
    } else {
      console.error(`Error fetching ${numberId} numbers:`, error.message);
    }
    return [];
  }
};

// Endpoint to handle number types
app.get('/numbers/:numberId', async (req, res) => {
  const { numberId } = req.params;
  
  // Validate the numberId
  if (!['p', 'f', 'e', 'r'].includes(numberId)) {
    return res.status(400).json({ error: 'Invalid number type. Must be one of: p, f, e, r' });
  }
  
  try {
    // Store the previous state for response
    const windowPrevState = [...numberStore[numberId]];
    
    // Fetch new numbers
    const newNumbers = await fetchNumbers(numberId);
    
    // Process new unique numbers
    const uniqueNewNumbers = newNumbers.filter(num => !numberStore[numberId].includes(num));
    
    // Add unique numbers to the store
    uniqueNewNumbers.forEach(num => {
      numberStore[numberId].push(num);
    });
    
    // Maintain the window size
    if (numberStore[numberId].length > WINDOW_SIZE) {
      numberStore[numberId] = numberStore[numberId].slice(-WINDOW_SIZE);
    }
    
    // Calculate average
    const avg = calculateAverage(numberStore[numberId]);
    
    // Format response according to requirements
    res.json({
      windowPrevState,
      windowCurrState: numberStore[numberId],
      numbers: newNumbers,  // The actual response from 3rd party server
      avg: parseFloat(avg.toFixed(2))  // Format to 2 decimal places
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});