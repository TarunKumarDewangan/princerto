import { useState, useEffect } from 'react';
import { Form, ListGroup, Spinner, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/apiClient';
import './GlobalSearch.css'; // We will create this CSS file next

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // This effect runs a search API call when the user stops typing
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    const delayDebounce = setTimeout(() => {
      api.get(`/global-search?query=${query}`)
        .then(response => {
          setResults(response.data);
        })
        .catch(() => {
          setResults([]); // Clear results on error
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleResultClick = (url) => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    navigate(url);
  };

  return (
    <div className="global-search-wrapper">
      <Form.Control
        type="search"
        placeholder="Search anything..."
        className="me-2"
        aria-label="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setShowResults(true); }}
        onBlur={() => setTimeout(() => setShowResults(false), 200)} // Delay to allow click
      />
      {showResults && (
        <div className="search-results-popover">
          <ListGroup>
            {loading && <ListGroup.Item className="text-center"><Spinner animation="border" size="sm" /></ListGroup.Item>}

            {!loading && results.length === 0 && query.length >= 2 && (
              <ListGroup.Item>No results found for "{query}"</ListGroup.Item>
            )}

            {!loading && results.map((result, index) => (
              <ListGroup.Item
                key={index}
                action
                onClick={() => handleResultClick(result.url)}
              >
                <div className="d-flex justify-content-between">
                  <div className="fw-bold">{result.title}</div>
                  <Badge bg="secondary">{result.type}</Badge>
                </div>
                <div className="small text-muted">{result.description}</div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
}
