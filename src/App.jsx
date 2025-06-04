import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';

function App() {
  const [userInput, setUserInput] = useState('');
  const [genOutput, setGenOutput] = useState(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

  const handleChange = (e) => {
    setUserInput(e.target.value);
  };

  const callAI = () => {
    getResponseForGivenPrompt(userInput);
    // setUserInput('');
  };

  const clearAll = () => {
    setUserInput('');
    setGenOutput(null);
  }

  const getResponseForGivenPrompt = async (userInput) => {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        temperature: 1,
        topP: 0.95,
        topK: 1,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain',
        systemInstruction: {
          role: 'user',
          parts: [{ text: import.meta.env.VITE_PROMPT }]
        }
      });

      const result = await model.generateContent(userInput);
      const response = result.response;
      const text = response.text();
      console.log('Raw response:', text);

      const parsed = makeJsonValue(text);
      if (parsed) {
        setGenOutput(parsed);
      }
    } catch (error) {
      console.log(error);
      console.log('Something Went Wrong');
    }
  };

const makeJsonValue = (rawText) => {
  try {
    const cleaned = rawText
      
      .replace(/```(?:json)?\s*/g, '')
      .replace(/```/g, '')
      
      .replace(/(['"])?([a-zA-Z0-9_\- ]+)\1(?=\s*:)/g, '"$2"')
      .replace(/'/g, '"') 
      .trim();

    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return null;
  }
};


return (
  <div className="main-div" style={{ maxWidth: 700, margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
    <textarea
      className="sub-wid sub-wid-inp"
      placeholder="Enter input"
      value={userInput}
      onChange={handleChange}
    />
    <div className='btn-lst'>
      <button className="sub-wid-btn" onClick={callAI} >Code</button>
      <button className="sub-wid-btn" onClick={clearAll} >Clear</button>
    </div>

    {genOutput && (
      <div
        className="response-box"
        style={{
          marginTop: 20,
          backgroundColor: '#f9f9f9',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontSize: 14,
        }}
      >
        {Object.entries(genOutput).map(([sectionTitle, content]) => (
          <section key={sectionTitle} style={{ marginBottom: 24 }}>
            <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: 6, color: '#007bff' }}>
              {sectionTitle}
            </h3>

            {/* String Value */}
            {typeof content === 'string' ? (
              <p
                style={{
                  fontWeight: '600',
                  color: content.trim().toUpperCase() === 'N/A' ? '#999' : '#333',
                  fontStyle: content.trim().toUpperCase() === 'N/A' ? 'italic' : 'normal',
                }}
              >
                {content}
              </p>
            ) : Array.isArray(content) ? (
              
              <ul style={{ paddingLeft: 20, lineHeight: 1.6, listStyleType: 'disc', color: '#444' }}>
                {content.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : content && typeof content === 'object' ? (
              
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginTop: 8,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#e1f0ff' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #ccc' }}>Code</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #ccc' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(content).map(([code, desc]) => (
                    <tr key={code}>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee', fontWeight: '600' }}>{code}</td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee' }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#999' }}>No data available</p>
            )}
          </section>
        ))}
      </div>
    )}
  </div>
);

}

export default App;
