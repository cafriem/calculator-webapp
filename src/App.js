import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const [lastCursorPos, setLastCursorPos] = useState(0);
  const displayRef = useRef(null);

  const handleButtonClick = useCallback((value) => {
    if (value === "=") {
      try {
        // Replace sin(x), cos(x), tan(x), log(x) with Math.sin/cos/tan/log10 and convert degrees to radians for trig
        let expr = display
          .replace(/sin\(([^)]+)\)/g, (m, x) => `Math.sin((${x})*Math.PI/180)`)
          .replace(/cos\(([^)]+)\)/g, (m, x) => `Math.cos((${x})*Math.PI/180)`)
          .replace(/tan\(([^)]+)\)/g, (m, x) => `Math.tan((${x})*Math.PI/180)`)
          .replace(/log\(([^)]+)\)/g, (m, x) => `Math.log10(${x})`)
          // Insert * for implicit multiplication with π
          .replace(/(\d)π/g, '$1*π')
          .replace(/π(\d)/g, 'π*$1')
          .replace(/π/g, 'Math.PI');
        // eslint-disable-next-line no-eval
        let result = eval(expr);
        // Round to nearest 1/1000000 (6 decimal places)
        if (!isNaN(result) && isFinite(result)) {
          result = Math.round(result * 1e6) / 1e6;
        }
        result = result.toString();
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
      setDisplay(display.slice(0, cursorPos) + 'π' + display.slice(cursorPos));
      setCursorPos(cursorPos + 1);
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

  useEffect(() => {
    // Prevent cursor from landing inside function names
    const funcNames = ["sin(", "cos(", "tan(", "log("];
    let found = false;
    for (const func of funcNames) {
      for (let i = 1; i < func.length; i++) {
        if (
          cursorPos - i >= 0 &&
          display.slice(cursorPos - i, cursorPos + (func.length - i)) === func
        ) {
          found = true;
          if (cursorPos > lastCursorPos) {
            // Moving right: jump to just inside the parentheses
            setCursorPos(cursorPos - i + func.length);
          } else {
            // Moving left: jump to just before the function name
            setCursorPos(cursorPos - i);
          }
          break;
        }
      }
      if (found) break;
    }
    if (!found) setLastCursorPos(cursorPos);
  }, [cursorPos, display, lastCursorPos]);

  useEffect(() => {
    // Scroll display to keep cursor visible
    if (displayRef.current) {
      const cursorElem = displayRef.current.querySelector('.calc-cursor');
      if (cursorElem) {
        const cursorRect = cursorElem.getBoundingClientRect();
        const displayRect = displayRef.current.getBoundingClientRect();
        if (cursorRect.left < displayRect.left) {
          displayRef.current.scrollLeft -= (displayRect.left - cursorRect.left) + 10;
        } else if (cursorRect.right > displayRect.right) {
          displayRef.current.scrollLeft += (cursorRect.right - displayRect.right) + 10;
        }
      }
    }
  }, [cursorPos, display]);

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
          <div className="display" style={{ flex: 1 }} ref={displayRef}>
            {display.slice(0, cursorPos)}
            <span className="calc-cursor" style={{ display: 'inline-block', width: '1ch', color: '#1976d2', fontWeight: 'bold', animation: 'blink 1s steps(1) infinite' }}>|</span>
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
