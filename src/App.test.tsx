import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CurrencyConverter from './CurrencyConverter';

describe('CurrencyConverter', () => {
  it('should render the component', () => {
    render(<CurrencyConverter defaultCurrency="USD" defaultConvertTo="EUR" />);
    const heading = screen.getByRole('heading', { name: /currency converter/i });
    expect(heading).toBeInTheDocument();
  });

  it('should fetch the list of currencies on mount', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({ EUR: 'Euro', USD: 'United States Dollar' }),
    } as Response);
    render(<CurrencyConverter defaultCurrency="USD" defaultConvertTo="EUR" />);
    await screen.findByLabelText('Convert from');
    expect(global.fetch).toHaveBeenCalledWith('https://openexchangerates.org/api/currencies.json');
  });

  it('should handle currency selection and conversion', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({ rates: { EUR: 0.833041, USD: 1 } }),
    } as Response);
    render(<CurrencyConverter defaultCurrency="USD" defaultConvertTo="EUR" />);
    const amountInput = screen.getByLabelText('Amount') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '100' } });
    const convertFromSelect = screen.getByLabelText('Convert from');
    fireEvent.change(convertFromSelect, { target: { value: 'USD' } });
    const convertToSelector = screen.getByLabelText('Convert to');
    fireEvent.change(convertToSelector, { target: { value: 'EUR' } });
    const convertButton = screen.getByRole('button', { name: /convert/i });
    fireEvent.click(convertButton);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });
    const convertedAmount = screen.getByText('83.30') as HTMLElement;
    expect(convertedAmount).toBeInTheDocument();
  });

  it('should handle currency swap', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => ({ rates: { EUR: 0.833041, USD: 1 } }),
    } as Response);
    render(<CurrencyConverter defaultCurrency="USD" defaultConvertTo="EUR" />);
    const convertFromSelect = screen.getByLabelText('Convert from');
    fireEvent.change(convertFromSelect, { target: { value: 'USD' } });
    const convertToSelector = screen.getByLabelText('Convert to');
    fireEvent.change(convertToSelector, { target: { value: 'EUR' } });
    const swapButton = screen.getByRole('button', { name: /swap/i });
    fireEvent.click(swapButton);
    const convertedAmount = screen.getByText('1.00') as HTMLElement;
    expect(convertedAmount).toBeInTheDocument();
  });
});
