import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Button from '../components/Button';
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestsCount, setRequestsCount] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [lang, setLang] = useState('en');
  const [result, setResult] = useState(null);
  const [selectedOption, setSelectedOption] = useState('whois');
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'en';
    setLang(savedLang);
    document.documentElement.lang = savedLang;
  }, []);

  const handleSubmit = async () => {
    const currentTime = Date.now();
    const timeDifference = currentTime - lastRequestTime;
    if (requestsCount >= 5 && timeDifference < 60000) {
      toast.error(
        lang === 'en'
          ? 'You have exceeded the request limit! Please wait a minute.'
          : 'İstek sınırını aştınız! Lütfen bir dakika bekleyin.'
      );
      return;
    }

    if (!url) {
      toast.error(
        lang === 'en' ? 'Please enter a valid URL!' : 'Lütfen geçerli bir URL girin!'
      );
      return;
    }

    setLoading(true);
    setRequestsCount((prev) => prev + 1);
    setLastRequestTime(currentTime);

    try {
      const response = await fetch(`/api/${selectedOption}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(
          lang === 'en' ? 'Failed to fetch the site.' : 'Siteyi almak başarısız oldu.'
        );
      }

      const data = await response.json();
      setResult(data);
      toast.success(
        lang === 'en' ? 'Data fetched successfully!' : 'Veriler başarıyla alındı!'
      );
    } catch (error) {
      toast.error(
        lang === 'en' ? 'Error fetching the site.' : 'Site alınırken hata oluştu.'
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLangChange = (newLang) => {
    localStorage.setItem('lang', newLang);
    setLang(newLang);
    document.documentElement.lang = newLang;
  };

  const renderTableData = (data) => {
    if (typeof data === 'object' && !Array.isArray(data)) {
      return Object.entries(data).map(([key, value]) => (
        <tr key={key}>
          <td>{key}</td>
          <td>{typeof value === 'object' ? renderTableData(value) : value}</td>
        </tr>
      ));
    }
    return <td>{data}</td>;
  };

  const toggleJsonVisibility = () => {
    setShowJson(!showJson);
  };

  return (
    <div className="app">
      <header>
        <div className="logo-container">
          <img src="/scavenix.png" alt="Scavenix Logo" className="logo" />
        </div>
        <div className="language-selector">
          <img
            src="/english-flag.png"
            alt="English"
            onClick={() => handleLangChange('en')}
            className="flag"
          />
          <img
            src="/turkish-flag.png"
            alt="Türkçe"
            onClick={() => handleLangChange('tr')}
            className="flag"
          />
        </div>
      </header>
      <main>
        <h1>Scavenix • shukurzade</h1>
        <div className="menu">
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="select-menu"
          >
            <option value="whois">{lang === 'en' ? 'Whois' : 'Whois'}</option>
          </select>
        </div>
        <input
          type="url"
          placeholder={lang === 'en' ? 'Enter a url ( ex: google.com )' : 'Bir url girin ( ör: google.com)'}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="url-input"
        />
        <Button onClick={handleSubmit} loading={loading} />
        {result && (
          <div className="result-container">
            <h3>{lang === 'en' ? 'Fetched Result' : 'Alınan Sonuç'}</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{lang === 'en' ? 'Key' : 'Anahtar'}</th>
                    <th>{lang === 'en' ? 'Value' : 'Değer'}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.whoisData).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{typeof value === 'object' ? renderTableData(value) : value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={toggleJsonVisibility} className="json-button">
              {lang === 'en' ? 'Toggle JSON View' : 'JSON Görünümünü Aç'}
            </button>
            {showJson && (
              <pre className="json-output">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}
      </main>
      <ToastContainer />
      <style jsx>{`
        .app {
          background-color: #ffffff;
          font-family: 'Arial', sans-serif;
          color: #333;
          min-height: 100vh;
          padding: 30px;
          display: flex;
          flex-direction: column;
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          width: 100%;
        }

        .logo {
          height: 80px;
        }

        .language-selector {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 15px;
        }

        .flag {
          width: 30px;
          cursor: pointer;
        }

        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .menu {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .select-menu {
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .select-menu:focus {
          outline: none;
          background: #0056b3;
        }

        .url-input {
          width: 60%;
          padding: 12px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 5px;
          margin-bottom: 30px;
          margin-left: 20%;
        }

        .result-container {
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .table-container {
          overflow-x: auto;
        }

        .result-container table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          border: 1px solid #ddd;
          text-align: left;
        }

        th {
          background-color: #f2f2f2;
          font-weight: 600;
        }

        td {
          font-size: 16px;
        }

        .json-button {
          padding: 10px 20px;
          font-size: 16px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 20px;
        }

        .json-button:hover {
          background-color: #218838;
        }

        .json-output {
          margin-top: 20px;
          padding: 10px;
          background-color: #f1f1f1;
          border-radius: 5px;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-size: 14px;
          font-family: 'Courier New', Courier, monospace;
        }

        @media (max-width: 768px) {
          .select-menu {
            font-size: 14px;
          }

          .url-input {
            width: 100%;
            margin-left: 0;
          }

          .result-container table {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
