import React, { useState } from 'react';
import { AppProps } from '../../../types';
import './Calculator.css';

const Calculator: React.FC<AppProps> = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState('');

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (op: string) => {
    const current = parseFloat(display);
    if (prevValue !== null && !waitingForOperand) {
      const result = calculate(parseFloat(prevValue), current, operator!);
      setDisplay(String(result));
      setPrevValue(String(result));
      setExpression(String(result) + ' ' + op + ' ');
    } else {
      setPrevValue(display);
      setExpression(display + ' ' + op + ' ');
    }
    setOperator(op);
    setWaitingForOperand(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      case '%': return a % b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (prevValue === null || operator === null) return;
    const current = parseFloat(display);
    const result = calculate(parseFloat(prevValue), current, operator);
    const rounded = parseFloat(result.toFixed(10));
    setDisplay(String(rounded));
    setExpression('');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setExpression('');
  };

  const handleBackspace = () => {
    if (waitingForOperand) return;
    if (display.length === 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleToggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const buttons = [
    { label: '%', action: () => handleOperator('%'), className: 'op-btn' },
    { label: 'CE', action: () => setDisplay('0'), className: 'op-btn' },
    { label: 'C', action: handleClear, className: 'op-btn' },
    { label: '⌫', action: handleBackspace, className: 'op-btn' },
    { label: '1/x', action: () => setDisplay(String(1 / parseFloat(display))), className: 'op-btn' },
    { label: 'x²', action: () => setDisplay(String(Math.pow(parseFloat(display), 2))), className: 'op-btn' },
    { label: '√x', action: () => setDisplay(String(Math.sqrt(parseFloat(display)))), className: 'op-btn' },
    { label: '÷', action: () => handleOperator('÷'), className: 'calc-op active-op' },
    { label: '7', action: () => inputDigit('7'), className: 'num-btn' },
    { label: '8', action: () => inputDigit('8'), className: 'num-btn' },
    { label: '9', action: () => inputDigit('9'), className: 'num-btn' },
    { label: '×', action: () => handleOperator('×'), className: 'calc-op active-op' },
    { label: '4', action: () => inputDigit('4'), className: 'num-btn' },
    { label: '5', action: () => inputDigit('5'), className: 'num-btn' },
    { label: '6', action: () => inputDigit('6'), className: 'num-btn' },
    { label: '-', action: () => handleOperator('-'), className: 'calc-op active-op' },
    { label: '1', action: () => inputDigit('1'), className: 'num-btn' },
    { label: '2', action: () => inputDigit('2'), className: 'num-btn' },
    { label: '3', action: () => inputDigit('3'), className: 'num-btn' },
    { label: '+', action: () => handleOperator('+'), className: 'calc-op active-op' },
    { label: '+/-', action: handleToggleSign, className: 'num-btn' },
    { label: '0', action: () => inputDigit('0'), className: 'num-btn' },
    { label: '.', action: inputDecimal, className: 'num-btn' },
    { label: '=', action: handleEquals, className: 'equals-btn' },
  ];

  return (
    <div className="calculator">
      <div className="calc-display">
        <div className="calc-expression">{expression}</div>
        <div className="calc-value">{display.length > 12 ? parseFloat(display).toExponential(6) : display}</div>
      </div>
      <div className="calc-buttons">
        {buttons.map((btn, i) => (
          <button key={i} className={`calc-btn ${btn.className}`} onClick={btn.action}>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
