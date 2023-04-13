// Do the required imports
import React, { useState, useEffect, useMemo } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { FiChevronDown } from "react-icons/fi";
import Select, { components } from 'react-select';
import SwapIcon from './images/swap.svg';

interface CurrencyConverterProps {
    defaultCurrency: string;
    defaultConvertTo: string;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ defaultCurrency, defaultConvertTo }) => {

  // Setup the states.
  const [currencies, setCurrencies] = useState<{[key: string]: string}>({});
  const [convertFrom, setConvertFrom] = useState<string>(defaultCurrency) || 'Awaiting';
  const [convertTo, setConvertTo] = useState<string>(defaultConvertTo) || 'Awaiting';
  const [amount, setAmount] = useState<string>('100');
  const [convertDisable, setConvertDisable] = useState<boolean>(false);
  const [convertedAmount, setConvertedAmount] = useState<number | undefined>(undefined);
  const [countdown, setCountdown] = useState<number>(10);
  const [error, setError] = useState<string | undefined>(undefined);

  // Fetch the list of currencies on when the component mounts.
  useEffect(() => {
    axios.get('https://openexchangerates.org/api/currencies.json')
      .then((response: AxiosResponse) => {
        const currencies = response.data;
        setCurrencies(currencies);
      })
      .catch((error: AxiosError) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCountdown(0);
    }
  }, [countdown]);

  const selectOptionStyle = {
    control: (baseStyles : any, state : any) => ({
      ...baseStyles,
      marginBottom: '2rem',
      border: 'none',
      boxShadow: 'none'
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#2857a3',
    }),
    dropdownIndicator: (provided : any) => ({
      ...provided,
      "svg": {

        fill: "#2857a3",
        size: '1rem',
        stroke: 'none'
      }
    }),
  };

  const customDropdownIndicator = (props:any) => {
    return (
      <components.DropdownIndicator {...props}>
        <FiChevronDown />
      </components.DropdownIndicator>
    );
  };

  // handle currency selection
  const handleConvertFrom = (option?: { value: string; label: string; } | null) => {
    if (option) {
      setConvertFrom(option.value);
    }
  };
  
  const handleConvertTo = (option?: { value: string; label: string; } | null) => {
    if (option) {
      setConvertTo(option.value);
    }
  };

  // handle amount input
  const handleAmountInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const regex = /^-?\d*\.?\d*$/;

    setConvertedAmount(undefined);

    if(!regex.test(inputValue)){
      setConvertDisable(true);
      setError(inputValue + ' is not a valid number')
    } else {
      setConvertDisable(false);
      setError(undefined);
    }
    
    setAmount(inputValue);
    
  };

  // Sort out the currency conversion using the API given in the test.
  const handleConversion = () => {
    axios.get(`https://api.exchangerate-api.com/v4/latest/${convertFrom}`)
      .then((response: AxiosResponse) => {
        const rates = response.data.rates;
        const rate = rates[convertTo];
        if (rate) {
          const convertedAmount = parseFloat(amount) * rate;
          setConvertedAmount(convertedAmount);
          setCountdown(10);
        } else {
          setError('Unable to convert currency');
        }
      })
      .catch((error: AxiosError) => { 
        console.error(error);
      });
  };

  // Deal with the currency swap functionality.
  const handleCurrencySwap = () => {
    setConvertFrom(convertTo);
    setConvertTo(convertFrom);
    setConvertedAmount(undefined);
  };

  // Store the currency options and I decided to useMemo hook so that it won't be regenerated on every re-render.
  const currencyOptions = useMemo(() => {
    return Object.keys(currencies).map(key => ({
      value: key,
      label: `${key} (${currencies[key]})`
    }));
  }, [currencies]);

  return (
    <div className='currencyConverter'>
      <h1>Currency Converter</h1>

      <div className="conversionSettings">
        <label>Amount</label>
        <input 
            type="text" 
            value={amount} 
            onChange={handleAmountInput} 
        />
        <button 
            className="swapper"
            onClick={handleCurrencySwap}
        ><img src={SwapIcon} /></button>
        {error && <div className="error">{error}</div>}
      </div>

      <div className="currencyDropdowns">
        <Select
          value={{ 
            value: convertFrom, 
            label: `${convertFrom}/${currencies[convertFrom] || ""}`
          }}
          onChange={handleConvertFrom}
          options={currencyOptions}
          styles={selectOptionStyle}
          components={{
            IndicatorSeparator: () => null,
            DropdownIndicator: customDropdownIndicator
          }}
        />
        <Select
          value={{ 
            value: convertTo, 
            label: `${convertTo}/${currencies[convertTo] || ""}`
          }}
          onChange={handleConvertTo}
          options={currencyOptions}
          styles={selectOptionStyle}
          components={{
            IndicatorSeparator: () => null,
            DropdownIndicator: customDropdownIndicator
          }}
        />
      </div>

      <div className="conversionResult">
        {convertedAmount && countdown > 0 && (
        <div>
            <p>{amount} {convertFrom} is equivilent to {convertedAmount.toFixed(2)} {convertTo}</p>
            <div className="expiresIn">
              Expires in: {countdown}
            </div>
        </div>
        )}
      </div>

      <div className="convertArea">
        <button 
            onClick={handleConversion}
            disabled={convertDisable}
        >
            Convert
        </button>
      </div>

    </div>
    );

};

export default CurrencyConverter;