import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const basicButtons = [
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "=", "+"]
];

const scientificButtons = [
  ["sin", "cos", "tan", "log"],
  ["√", "x²", "x³", "x^y"],
  ["π", "e", "!", "1/x"],
  ["(", ")", "^", "%"]
];

function App() {
  const [mode, setMode] = useState("basic");
  const [display, setDisplay] = useState("");
  const [cursorPos, setCursorPos] = useState(0); // New: cursor position
  const [history, setHistory] = useState([]);

  const handleButtonClick = useCallback((value) => {
    if (value === "=") {
      try {
        // Replace sin(x), cos(x), tan(x), log(x) with Math.sin/cos/tan/log10 and convert degrees to radians for trig
        let expr = display
          .replace(/sin\(([^)]+)\)/g, (m, x) => `Math.sin((${x})*Math.PI/180)`)
          .replace(/cos\(([^)]+)\)/g, (m, x) => `Math.cos((${x})*Math.PI/180)`)
          .replace(/tan\(([^)]+)\)/g, (m, x) => `Math.tan((${x})*Math.PI/180)`)
          .replace(/log\(([^)]+)\)/g, (m, x) => `Math.log10(${x})`);
        // eslint-disable-next-line no-eval
        const result = eval(expr).toString();
        setHistory((prev) => [...prev, { expr: display, result }]);
        setDisplay(result);
        setCursorPos(result.length); // Move cursor to end
      } catch {
        setDisplay("Error");
        setCursorPos(0);
      }
    } else if (["sin", "cos", "tan", "log"].includes(value)) {
      // Insert function with parentheses at cursor, place cursor inside parentheses (after function name)
      const funcText = value + '()';
      setDisplay(display.slice(0, cursorPos) + funcText + display.slice(cursorPos));
      setCursorPos(cursorPos + funcText.length - 1); // cursor just inside the ()
    } else if (value === "π") {
      const pi = Math.PI.toString();
      setDisplay(display.slice(0, cursorPos) + pi + display.slice(cursorPos));
      setCursorPos(cursorPos + pi.length);
    } else if (value === "e") {
      const e = Math.E.toString();
      setDisplay(display.slice(0, cursorPos) + e + display.slice(cursorPos));
      setCursorPos(cursorPos + e.length);
    } else if (value === "√") {
      try {
        const num = parseFloat(display);
        const result = Math.sqrt(num).toString();
        setHistory((prev) => [...prev, { expr: `√(${display})`, result }]);
        setDisplay(result);
        setCursorPos(result.length);
      } catch {
        setDisplay("Error");
        setCursorPos(0);
      }
    } else if (value === "x²") {
      try {
        const num = parseFloat(display);
        const result = (num * num).toString();
        setHistory((prev) => [...prev, { expr: `${display}²`, result }]);
        setDisplay(result);
        setCursorPos(result.length);
      } catch {
        setDisplay("Error");
        setCursorPos(0);
      }
    } else if (value === "x³") {
      try {
        const num = parseFloat(display);
        const result = (num * num * num).toString();
        setHistory((prev) => [...prev, { expr: `${display}³`, result }]);
        setDisplay(result);
        setCursorPos(result.length);
      } catch {
        setDisplay("Error");
        setCursorPos(0);
      }
    } else if (value === "1/x") {
      try {
        const num = parseFloat(display);
        const result = (1 / num).toString();
        setHistory((prev) => [...prev, { expr: `1/${display}`, result }]);
        setDisplay(result);
        setCursorPos(result.length);
      } catch {
        setDisplay("Error");
        setCursorPos(0);
      }
    } else if (value === "!") {
      try {
        const num = parseInt(display);
        if (num < 0) {
          setDisplay("Error");
          setCursorPos(0);
          return;
        }
        let factorial = 1;
        for (let i = 2; i <= num; i++) {
          factorial *= i;
        }
        const result = factorial.toString();
        setHistory((prev) => [...prev, { expr: `${display}!`, result }]);
        setDisplay(result);
        setCursorPos(result.length);
      } catch {
        setDisplay("Error");
        setCursorPos(0);
      }
    } else if (value === "C") {
      setDisplay("");
      setCursorPos(0);
    } else {
      setDisplay(display.slice(0, cursorPos) + value + display.slice(cursorPos));
      setCursorPos(cursorPos + value.length);
    }
  }, [display, cursorPos]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if ((/^[0-9]$/).test(key)) {
        setDisplay((prev) => prev.slice(0, cursorPos) + key + prev.slice(cursorPos));
        setCursorPos((pos) => pos + 1);
      } else if (["+", "-", "*", "/", ".", "%", "(", ")", "^"].includes(key)) {
        setDisplay((prev) => prev.slice(0, cursorPos) + key + prev.slice(cursorPos));
        setCursorPos((pos) => pos + 1);
      } else if (key === "Enter" || key === "=") {
        handleButtonClick("=");
      } else if (key === "Backspace") {
        if (cursorPos > 0) {
          setDisplay((prev) => prev.slice(0, cursorPos - 1) + prev.slice(cursorPos));
          setCursorPos((pos) => pos - 1);
        }
      } else if (key === "Delete") {
        setDisplay((prev) => prev.slice(0, cursorPos) + prev.slice(cursorPos + 1));
      } else if (key === "ArrowLeft") {
        setCursorPos((pos) => Math.max(0, pos - 1));
      } else if (key === "ArrowRight") {
        setCursorPos((pos) => Math.min(display.length, pos + 1));
      } else if (key.toLowerCase() === "c") {
        setDisplay("");
        setCursorPos(0);
      }
      // Scientific functions via keyboard
      else if (mode === "scientific") {
        if (key.toLowerCase() === "s") handleButtonClick("sin");
        else if (key.toLowerCase() === "o") handleButtonClick("cos");
        else if (key.toLowerCase() === "t") handleButtonClick("tan");
        else if (key.toLowerCase() === "l") handleButtonClick("log");
        else if (key.toLowerCase() === "p") handleButtonClick("π");
        else if (key.toLowerCase() === "e") handleButtonClick("e");
        else if (key === "r") handleButtonClick("√");
        else if (key === "2") handleButtonClick("x²");
        else if (key === "3") handleButtonClick("x³");
        else if (key === "i") handleButtonClick("1/x");
        else if (key === "f") handleButtonClick("!");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display, mode, handleButtonClick, cursorPos]);

  return (
    <div className="app-layout">
      <div className={`calculator-container${mode === "scientific" ? " scientific" : ""}`}>
        <h1>Calculator</h1>
        <div className="mode-toggle">
          <button
            className={mode === "basic" ? "active" : ""}
            onClick={() => setMode("basic")}
          >
            Basic
          </button>
          <button
            className={mode === "scientific" ? "active" : ""}
            onClick={() => setMode("scientific")}
          >
            Scientific
          </button>
        </div>
        <div className="display-controls" style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <button
            aria-label="Move cursor left"
            style={{ marginRight: 8 }}
            onClick={() => {
              // If moving left would put cursor inside a function name, skip to before the function
              let newPos = cursorPos - 1;
              const funcMatch = display.slice(0, cursorPos).match(/(sin|cos|tan|log)\($/);
              if (funcMatch) {
                newPos = cursorPos - funcMatch[0].length;
              }
              setCursorPos(Math.max(0, newPos));
            }}
            disabled={cursorPos === 0}
          >
            ◀
          </button>
          <div className="display" style={{ flex: 1 }}>
            {display.slice(0, cursorPos)}
            <span style={{ display: 'inline-block', width: '1ch', color: '#1976d2', fontWeight: 'bold', animation: 'blink 1s steps(1) infinite' }}>|</span>
            {display.slice(cursorPos) || (cursorPos === 0 ? '0' : '')}
          </div>
          <button
            aria-label="Move cursor right"
            style={{ marginLeft: 8 }}
            onClick={() => {
              // If moving right would put cursor inside a function name, skip to after the function name and (
              let newPos = cursorPos + 1;
              const after = display.slice(cursorPos, cursorPos + 4);
              if (["sin(", "cos(", "tan(", "log("].includes(after)) {
                newPos = cursorPos + 4;
              }
              setCursorPos(Math.min(display.length, newPos));
            }}
            disabled={cursorPos === display.length}
          >
            ▶
          </button>
        </div>
        <div className="buttons">
          {(mode === "scientific" ? scientificButtons : []).map((row, i) => (
            <div className="button-row" key={"sci-" + i}>
              {row.map((btn) => (
                <button key={btn} onClick={() => handleButtonClick(btn)}>
                  {btn}
                </button>
              ))}
            </div>
          ))}
          {basicButtons.map((row, i) => (
            <div className="button-row" key={i}>
              {row.map((btn) => (
                <button key={btn} onClick={() => handleButtonClick(btn)}>
                  {btn}
                </button>
              ))}
            </div>
          ))}
          <div className="button-row">
            <button onClick={() => handleButtonClick("C")}>C</button>
          </div>
        </div>
      </div>
      <div className="history-panel">
        <div className="history-header">
          <h2>History</h2>
          <button className="clear-history-btn" onClick={() => setHistory([])} aria-label="Clear history">🗑️</button>
        </div>
        <ul>
          {history.slice().reverse().map((item, idx) => (
            <li key={idx}>
              <div className="history-expr">{item.expr}</div>
              <div className="history-result">= {item.result}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
