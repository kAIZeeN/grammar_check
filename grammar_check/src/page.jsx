import { useState } from "react";
import logo from "./assets/logo.png";
import "./page.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Page({ onLogout }) {
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(`${apiUrl}/grammar-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputValue }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      const outputText = data.output || "No output returned.";
      
      // Try to parse if it's JSON, otherwise use as-is
      try {
        const parsed = JSON.parse(outputText);
        setOutputValue(parsed);
      } catch {
        setOutputValue(outputText);
      }
    } catch (err) {
      setError("Unable to check grammar right now.");
    }
  };

  return (
    <div className="page-content">
        <header className="header-page">
          <div className="header-left">
            <img className="logo" src={logo} alt="Logo" />
            <h2>WriteWise</h2>
          </div>
          <div className="header-right">
            <button type="button" className="logout-button" onClick={onLogout}>
              Log out
            </button>
          </div>
        </header>
        <br></br>
      <div className="page-banner">
        <h1>Grammar Checker</h1>
      </div>

      <form className="page-form" onSubmit={handleSubmit}>
        <label>Enter text to review:</label>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={8}
          className="page-textarea"
        />
        <button type="submit" className="page-button">
          Check Grammar
        </button>
      </form>

      {error && <p className="page-error">{error}</p>}

      {outputValue && (
        <div className="page-result">
          <h2>Result</h2>
          {typeof outputValue === 'object' ? (
            <div>
              <p><strong>Score:</strong> {outputValue.score}/100</p>
              <p><strong>Corrected Text:</strong> {outputValue.correctedText}</p>
              {outputValue.mistakes && outputValue.mistakes.length > 0 && (
                <div>
                  <strong>Mistakes Found:</strong>
                  <ul>
                    {outputValue.mistakes.map((mistake, idx) => (
                      <li key={idx}>
                        <strong>{mistake.original}</strong> → <strong>{mistake.correct}</strong>
                        <br />
                        <em>{mistake.reason}</em>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p>{outputValue}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Page;
