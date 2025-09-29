import { useState, useEffect } from 'react';
import { getForecast, ForecastResponse } from '../lib/api_service';

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#f4f7f9',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(169, 40, 40, 0.1)',
  },
  searchContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    flexGrow: 1,
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  sectionTitle: {
    fontSize: '24px',
    borderBottom: '2px solid #007bff',
    paddingBottom: '5px',
    marginBottom: '15px',
  },
  currentWeather: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  hourlyList: {
    listStyle: 'none',
    padding: 0,
  },
  hourlyItem: {
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  error: {
    color: 'red',
  },
};

export default function WeatherDashboard() {
  const [city, setCity] = useState('London');
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!city) {
      setError('Please enter a city name.');
      return;
    }
    setLoading(true);
    setError(null);
    setForecast(null);
    try {
      const data = await getForecast(city);
      setForecast(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div style={styles.container}>
      <h1>Weather Forecast Dashboard</h1>
      <div style={styles.searchContainer}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          style={styles.input}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} style={styles.button} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {forecast && (
        <>
          <h2 style={styles.sectionTitle}>Current Weather</h2>
          <div style={styles.currentWeather}>
            <p><strong>Time:</strong> {forecast.current.time}</p>
            <p><strong>Temperature:</strong> {forecast.current.temp_c}°C</p>
            <p><strong>Feels Like:</strong> {forecast.current.feels_like_c}°C</p>
            <p><strong>Description:</strong> {forecast.current.description}</p>
          </div>

          <h2 style={styles.sectionTitle}>Hourly Forecast</h2>
          <ul style={styles.hourlyList}>
            {forecast.hourly.map((item, index) => (
              <li key={index} style={styles.hourlyItem}>
                <span>{item.time}</span>
                <span>{item.temp_c}°C</span>
                <span>({item.description})</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
