import React from 'react';
import './App.scss';
import CurrencyConverter from './CurrencyConverter';

function App() {
  return (
    <div className="App">
      <CurrencyConverter 
        defaultCurrency="GBP" 
        defaultConvertTo="USD"
      />
    </div>
  );
}

export default App;