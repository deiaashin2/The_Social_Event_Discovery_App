// Jest configuration for backend tests
module.exports = { 
  testEnvironment: "node", // Use Node environment for backend testing
  testTimeout: 20000, 
  testMatch: ["**/__tests__/**/*.test.js"],  //execute all files inside the test folder 
};
