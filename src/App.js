import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser, faCheck, faTimeline, faXmark, faGamepad, faTicket, faTv, faBook  } from "@fortawesome/free-solid-svg-icons";
import { faSmile } from "@fortawesome/free-regular-svg-icons";  // Regular icon
import Releases from './releases.json';
import axios from "axios";
import Dot from "./components/dot";
import Line from "./components/line";
import InfoBox from "./components/info-box";
import { ReactComponent as Logo } from "./logo.svg";
import { width } from '@fortawesome/free-regular-svg-icons/faAddressBook';
import { addAbortListener } from 'events';

const MediaReleaseTracker = () => {
  // Initial sample data
  const initialReleases = Releases;

  // States
  const [releases, setReleases] = useState(initialReleases);
  const [newRelease, setNewRelease] = useState({
    title: '',
    type: 'Game',
    releaseDate: '',
    addedDate: '',
    notes: '',
    isCompleted: false,
    anticipation: 0,
    artist: '',
    hasNoDate: false
  });
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [showTimeline, setShowTimeline] = useState(false);
  const [visibleRelease, setVisibleRelease] = useState(releases[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMusic, setIsMusic] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [viewingRelease, setViewingRelease] = useState(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedReleases = localStorage.getItem('mediaReleases');
    if (savedReleases) {
      setReleases(JSON.parse(savedReleases));
    }
  }, []);

  // Save to localStorage whenever releases change
  useEffect(() => {
    localStorage.setItem('mediaReleases', JSON.stringify(releases));
  }, [releases]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'date') {
      newRelease.hasNoDate = false;
    }
    setNewRelease({ ...newRelease, [name]: value });
    const updatedRelease = { ...newRelease, [name]: value };
    setIsMusic(updatedRelease.type === 'Music');
  };

  const handleNoDate = (release) => {
    release.hasNoDate = !release.hasNoDate;
    release.date = release.hasNoDate ? '' : release.date;
    console.log(release.hasNoDate);
  };

  // Add new release
  const addRelease = () => {
    if (newRelease.title && newRelease.releaseDate) {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const release = {
        id: Date.now(),
        ...newRelease,
        addedDate: today
      };
      // Write to the JSON file
      axios
        .post("http://localhost:5000/api/releases", release) // Send the `release` object
        .then((response) => {
          console.log("Release added successfully: FE ", response.data);
        })
        .catch((error) => {
          console.error("Error adding release:", error);
        });
      setReleases([...releases, release]);
      setNewRelease({
        title: '',
        type: 'Game',
        releaseDate: '',
        notes: '',
        artist: '',
        anticipation: 0,
        isCompleted: false
      });
      setIsMusic(false);
    }
  };

  // Delete release
  const deleteRelease = (id) => {
    // Remove from the JSON file
    axios.delete(`http://localhost:5000/api/releases/${id}`, { withCredentials: true })
    .then(response => {
      console.log('Release deleted successfully:', response.data);
      setReleases(releases.filter(release => release.id !== id));
    })
    .catch(error => {
        console.error('Error deleting release:', error);
    });
  };

  // Toggle completion status
  const toggleComplete = (id) => {
    setReleases(releases.map(release => 
      release.id === id ? { ...release, isCompleted: !release.isCompleted } : release
    ));
  };

  // Filter releases
  const filteredReleases = releases.filter(release => {
    if (filter === 'All') return true;
    return release.type === filter;
  });

  // Sort releases
  const sortedReleases = [...filteredReleases].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.releaseDate) - new Date(b.releaseDate);
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'anticipation') {
      return b.anticipation - a.anticipation;
    }
  });

  // Calculate days until release
  const calculateDaysUntil = (releaseDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const release = new Date(releaseDate);
    const diffTime = release - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get media type color
  const getTypeColor = (type) => {
    switch(type) {
      case 'Game': return '#7B16FF';
      case 'Movie': return '#3380FF';
      case 'Music': return '#FF2E6E';
      case 'Book': return '#FFCC00';
      case 'TV-Show': return '#00CC66';
      default: return '#BBBBBB';
    }
  };

  const getTypeGradient = (type) => {
    switch(type) {
      case 'Game': return '#7B16FF30';
      case 'Movie': return '#3380FF30';
      case 'Music': return '#FF2E6E30';
      case 'Book': return '#FFCC0030';
      case 'TV-Show': return '#00CC6630';
      default: return '#BBBBBB30';
    }
  };

  // Get status color
  const getStatusColor = (releaseDate, isCompleted) => {
    if (isCompleted) return '#666666';
    
    const days = calculateDaysUntil(releaseDate);
    if (days < 0) return '#FF3333';
    if (days <= 7) return '#FFCC00';
    if (days <= 30) return '#3380FF';
    return '#00CC66';
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentDaysSinceJan = new Date().getMonth () * 30 + new Date().getDate();
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-indexed
  const year = currentDate.getFullYear();

  // Combine into ddmmyyyy format
  const formattedDate = `${day}/${month}/${year}`;
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  }
  const currentX = ((currentDaysSinceJan / 365) * (window.innerWidth*0.9*0.8)) + (window.innerWidth*0.05*0.8);

  // Create a filtered releases array based on search term
  const searchedReleases = sortedReleases.filter(release => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      release.title.toLowerCase().includes(searchLower) ||
      release.type.toLowerCase().includes(searchLower) ||
      (release.notes && release.notes.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg version="1.0" className='app-logo' xmlns="http://www.w3.org/2000/svg"
          width="35px" height="35px" viewBox="0 0 300.000000 300.000000"
          preserveAspectRatio="xMidYMid meet">
          <metadata>
          Created by potrace 1.10, written by Peter Selinger 2001-2011
          </metadata>
            <g transform="translate(0.000000,300.000000) scale(0.100000,-0.100000)"
            fill="#fff" stroke="none">
            <path d="M1285 2955 c-130 -21 -235 -51 -353 -101 -446 -191 -762 -575 -864
            -1049 -20 -94 -23 -138 -23 -300 1 -261 36 -421 140 -639 106 -220 300 -446
            495 -575 246 -163 475 -237 765 -248 226 -9 409 21 600 98 463 186 791 579
            896 1074 34 158 34 422 0 580 -124 583 -561 1022 -1143 1146 -126 27 -388 34
            -513 14z m401 -246 c206 -63 377 -236 429 -435 9 -34 15 -101 15 -162 0 -171
            -58 -311 -180 -432 -111 -111 -236 -164 -421 -181 -65 -5 -144 -16 -176 -25
            -336 -85 -530 -447 -418 -780 73 -217 245 -363 482 -408 l78 -15 -80 5 c-515
            34 -965 419 -1096 939 -27 103 -37 349 -20 465 27 185 115 400 223 545 180
            241 462 423 743 478 111 22 126 24 246 26 83 1 122 -4 175 -20z"/>
            </g>
          </svg>
          <h1 className="app-title">Release Date Tracker</h1>
        </div>
        {/*<button className='darkmode-toggle' onClick={toggleDarkMode}>
          {isDarkMode ? <FontAwesomeIcon icon={faSun} /> : <FontAwesomeIcon icon={faMoon} />}
        </button>*/}
      </header>
      
      <div className="main-container">
        <div className="sidebar">
        </div>
        <div className="tracker-section">
          <div className="filter-bar">
            <div className="filters">
              <div className="filter-group">
                <label>Filter:</label>
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="dark-select"
                >
                  <option value="All">All Types</option>
                  <option value="Game">Games</option>
                  <option value="Movie">Movies</option>
                  <option value="Music">Music</option>
                  <option value="Book">Books</option>
                  <option value="TV-Show">TV Shows</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Sort:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="dark-select"
                >
                  <option value="date">Release</option>
                  <option value="title">Title</option>
                  <option value="anticipation">Anticipation</option>
                </select>
              </div>
            </div>
            
            <div className="right-filter">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dark-input"
              />
              <button className="timeline-btn" onClick={() => setShowTimeline(!showTimeline)}>
                <FontAwesomeIcon icon={ faTimeline }  />
              </button>
            </div>
          </div>
          
          <div className="releases-list">
            {searchedReleases.length === 0 ? (
              <div className="no-releases">
                {searchTerm ? 'No matching releases for the search term.' : 'No releases found. Add some using the form.'}
              </div>
            ) : (
              <>
                {/* Releasing in the next 7 days */}
                {searchedReleases.some(release => {
                  const days = calculateDaysUntil(release.releaseDate);
                  return days > 0 && days <= 7;
                }) && (
                  <>
                    <div className="releases-header">
                      <h2 className="releases-title">This Week</h2>
                    </div>
                  
                    {searchedReleases.map(release => {
                      const daysUntil = calculateDaysUntil(release.releaseDate);
                      const typeColor = getTypeColor(release.type); 
                      const typeGradient = getTypeGradient(release.type);
                      const statusColor = getStatusColor(release.releaseDate, release.isCompleted);
                      
                      // Render release item
                      if (daysUntil > 0 && daysUntil <= 7) {
                        return (
                          <div 
                            key={release.id} 
                            className={`release-item ${release.isCompleted ? 'completed' : ''} zoom`}
                            style={{ 
                              borderLeftColor: typeColor, background: `linear-gradient(to left, ${typeGradient} 10%, #15171f 30%)`
                            }}
                            onClick={() => setViewingRelease(release)}
                          >
                            <div className="release-content">
                              <div className="release-header">
                                <div className="status-dot" style={{ backgroundColor: statusColor }}></div>
                                <h3 className="release-title">{release.title} <span className='release-artist'>{release.artist}</span></h3>
                              </div>
                              
                              <div className="release-details">
                                <div className="detail-row">
                                  <span className="detail-label">Type:</span>
                                  <span className="detail-value" style={{ color: typeColor }}>{release.type}</span>
                                </div>
                                
                                <div className="detail-row">
                                  <span className="detail-label">Release:</span>
                                  <div className="release-date-info">
                                    <span>{new Date(release.releaseDate).toLocaleDateString('en-GB')}</span>
                                    {daysUntil > 1   && (
                                      <span className="day-count" style={{ color: statusColor }}>
                                        {daysUntil} day{daysUntil !== 1 ? 's' : ''} remaining
                                      </span>
                                    )}
                                    {daysUntil === 0 && (
                                      <span className="today-indicator">TODAY!</span>
                                    )}
                                    {daysUntil === 1 && (
                                      <span className="day-count" style={{ color: "#7F96FF" }}>Tomorrow!</span>
                                    )}
                                    {daysUntil < 0 && (
                                      <span className="day-count" style={{ color: statusColor }}>
                                        {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''} ago
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {release.notes && (
                                  <div className="detail-row">
                                    <span className="detail-label">Notes:</span>
                                    <span className="detail-value">{release.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="release-divider">
                              {release.anticipation > 0 && (
                                <div className="anticipation-info">
                                  <FontAwesomeIcon icon={faSmile} />
                                  <span className="anticipation-value">{release.anticipation}/10</span>
                                </div>
                              )}
                              <div className="release-actions">
                                <button 
                                  onClick={() => toggleComplete(release.id)}
                                  className={`action-btn ${release.isCompleted ? 'undo-btn' : 'complete-btn'}`}
                                  title={release.isCompleted ? "Mark as not released" : "Mark as released"}
                                >
                                  {release.isCompleted ? "↩" : <FontAwesomeIcon icon={faCheck} />}
                                </button>
                                <button 
                                  onClick={() => deleteRelease(release.id)}
                                  className="action-btn delete-btn"
                                  title="Delete"
                                >
                                  <FontAwesomeIcon icon={faEraser} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </>
                )}

                {/* Releasing in the next 30 days */}
                {searchedReleases.some(release => {
                  const days = calculateDaysUntil(release.releaseDate);
                  return days > 7 && days <= 30;
                }) && (
                  <>
                    <div className="releases-header">
                      <h2 className="releases-title">This Month</h2>
                    </div>
                    {searchedReleases.map(release => {
                      const daysUntil = calculateDaysUntil(release.releaseDate);
                      const typeColor = getTypeColor(release.type); 
                      const typeGradient = getTypeGradient(release.type);
                      const statusColor = getStatusColor(release.releaseDate, release.isCompleted);
                      
                      // Render release item
                      if (daysUntil > 7 && daysUntil <= 30) {
                        return (
                          <div 
                            key={release.id} 
                            className={`release-item ${release.isCompleted ? 'completed' : ''} zoom`}
                            style={{ 
                              borderLeftColor: typeColor, background: `linear-gradient(to left, ${typeGradient} 10%, #15171f 30%)`
                            }}
                            onClick={() => setViewingRelease(release)}
                          >
                            <div className="release-content">
                              <div className="release-header">
                                <div className="status-dot" style={{ backgroundColor: statusColor }}></div>
                                <h3 className="release-title">{release.title} <span className='release-artist'>{release.artist}</span></h3>
                              </div>
                              
                              <div className="release-details">
                                <div className="detail-row">
                                  <span className="detail-label">Type:</span>
                                  <span className="detail-value" style={{ color: typeColor }}>{release.type}</span>
                                </div>
                                
                                <div className="detail-row">
                                  <span className="detail-label">Release:</span>
                                  <div className="release-date-info">
                                    <span>{new Date(release.releaseDate).toLocaleDateString('en-GB')}</span>
                                    {daysUntil > 0 && (
                                      <span className="day-count" style={{ color: statusColor }}>
                                        {daysUntil} day{daysUntil !== 1 ? 's' : ''} remaining
                                      </span>
                                    )}
                                    {daysUntil === 0 && (
                                      <span className="today-indicator">TODAY!</span>
                                    )}
                                    {daysUntil < 0 && (
                                      <span className="day-count" style={{ color: statusColor }}>
                                        {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''} ago
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {release.notes && (
                                  <div className="detail-row">
                                    <span className="detail-label">Notes:</span>
                                    <span className="detail-value">{release.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="release-divider">
                              {release.anticipation > 0 && (
                                <div className="anticipation-info">
                                  <FontAwesomeIcon icon={faSmile} />
                                  <span className="anticipation-value">{release.anticipation}/10</span>
                                </div>
                              )}
                              <div className="release-actions">
                                <button 
                                  onClick={() => toggleComplete(release.id)}
                                  className={`action-btn ${release.isCompleted ? 'undo-btn' : 'complete-btn'}`}
                                  title={release.isCompleted ? "Mark as not released" : "Mark as released"}
                                >
                                  {release.isCompleted ? "↩" : <FontAwesomeIcon icon={faCheck} />}
                                </button>
                                <button 
                                  onClick={() => deleteRelease(release.id)}
                                  className="action-btn delete-btn"
                                  title="Delete"
                                >
                                  <FontAwesomeIcon icon={faEraser} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </>
                )}

                {/* Releasing in the next Year */}
                {searchedReleases.some(release => {
                  const days = calculateDaysUntil(release.releaseDate);
                  return days > 30 && days <= 365;
                }) && (
                  <>
                    <div className="releases-header">
                      <h2 className="releases-title">This Year</h2>
                    </div>
                  
                    {searchedReleases.map(release => {
                      const daysUntil = calculateDaysUntil(release.releaseDate);
                      const typeColor = getTypeColor(release.type); 
                      const typeGradient = getTypeGradient(release.type);
                      const statusColor = getStatusColor(release.releaseDate, release.isCompleted);
                      
                      // Render release item
                      if (daysUntil > 30 && daysUntil <= 365) {
                        return (
                          <div 
                            key={release.id} 
                            className={`release-item ${release.isCompleted ? 'completed' : ''} zoom`}
                            style={{ 
                              borderLeftColor: typeColor, background: `linear-gradient(to left, ${typeGradient} 10%, #15171f 30%)`
                            }}
                            onClick={() => setViewingRelease(release)}
                          >
                            <div className="release-content">
                              <div className="release-header">
                                <div className="status-dot" style={{ backgroundColor: statusColor }}></div>
                                <h3 className="release-title">{release.title} <span className='release-artist'>{release.artist}</span></h3>
                              </div>
                              
                              <div className="release-details">
                                <div className="detail-row">
                                  <span className="detail-label">Type:</span>
                                  <span className="detail-value" style={{ color: typeColor }}>{release.type}</span>
                                </div>
                                
                                <div className="detail-row">
                                  <span className="detail-label">Release:</span>
                                  <div className="release-date-info">
                                    <span>{new Date(release.releaseDate).toLocaleDateString('en-GB')}</span>
                                    {daysUntil > 0 && (
                                      <span className="day-count" style={{ color: statusColor }}>
                                        {daysUntil} day{daysUntil !== 1 ? 's' : ''} remaining
                                      </span>
                                    )}
                                    {daysUntil === 0 && (
                                      <span className="today-indicator">TODAY!</span>
                                    )}
                                    {daysUntil < 0 && (
                                      <span className="day-count" style={{ color: statusColor }}>
                                        {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''} ago
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {release.notes && (
                                  <div className="detail-row">
                                    <span className="detail-label">Notes:</span>
                                    <span className="detail-value">{release.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="release-divider">
                              {release.anticipation > 0 && (
                                <div className="anticipation-info">
                                  <FontAwesomeIcon icon={faSmile} />
                                  <span className="anticipation-value">{release.anticipation}/10</span>
                                </div>
                              )}
                              <div className="release-actions">
                                <button 
                                  onClick={() => toggleComplete(release.id)}
                                  className={`action-btn ${release.isCompleted ? 'undo-btn' : 'complete-btn'}`}
                                  title={release.isCompleted ? "Mark as not released" : "Mark as released"}
                                >
                                  {release.isCompleted ? "↩" : <FontAwesomeIcon icon={faCheck} />}
                                </button>
                                <button 
                                  onClick={() => deleteRelease(release.id)}
                                  className="action-btn delete-btn"
                                  title="Delete"
                                >
                                  <FontAwesomeIcon icon={faEraser} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </>
                )}

                {/* Releasing in the future */}
                {searchedReleases.some(release => {
                  const days = calculateDaysUntil(release.releaseDate);
                  return days > 365;
                }) && (
                  <>
                    <div className="releases-header">
                      <h2 className="releases-title">In the Future</h2>
                    </div>
                  
                    {searchedReleases.map(release => {
                      const daysUntil = calculateDaysUntil(release.releaseDate);
                      const typeColor = getTypeColor(release.type); 
                      const typeGradient = getTypeGradient(release.type);
                      const statusColor = getStatusColor(release.releaseDate, release.isCompleted);
                      
                      // Render release item
                      if (daysUntil > 365) {
                        return (
                          <div 
                            key={release.id} 
                            className={`release-item ${release.isCompleted ? 'completed' : ''} zoom`}
                            style={{ 
                              borderLeftColor: typeColor, background: `linear-gradient(to left, ${typeGradient} 10%, #15171f 30%)`
                            }}
                            onClick={() => setViewingRelease(release)}
                          >
                            <div className="release-content">
                              <div className="release-header">
                                <div className="status-dot" style={{ backgroundColor: statusColor }}></div>
                                <h3 className="release-title">{release.title} <span className='release-artist'>{release.artist}</span></h3>
                              </div>
                              
                              <div className="release-details">
                                <div className="detail-row">
                                  <span className="detail-label">Type:</span>
                                  <span className="detail-value" style={{ color: typeColor }}>{release.type}</span>
                                </div>
                                
                                <div className="detail-row">
                                  <span className="detail-label">Release:</span>
                                  <div className="release-date-info">
                                    <span>{new Date(release.releaseDate).toLocaleDateString('en-GB')}</span>
                                    {daysUntil > 0 && (
                                      <span className="day-count" style={{ color: statusColor }}>
                                        {daysUntil} day{daysUntil !== 1 ? 's' : ''} remaining
                                      </span>
                                    )}
                                    {daysUntil === 0 && (
                                      <span className="today-indicator">TODAY!</span>
                                    )}
                                    {daysUntil < 0 && (
                                      <span className="day-count" style={{ color: statusColor }}>
                                        {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''} ago
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {release.notes && (
                                  <div className="detail-row">
                                    <span className="detail-label">Notes:</span>
                                    <span className="detail-value">{release.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="release-divider">
                              {release.anticipation > 0 && (
                                <div className="anticipation-info">
                                  <FontAwesomeIcon icon={faSmile} />
                                  <span className="anticipation-value">{release.anticipation}/10</span>
                                </div>
                              )}
                              <div className="release-actions">
                                <button 
                                  onClick={() => toggleComplete(release.id)}
                                  className={`action-btn ${release.isCompleted ? 'undo-btn' : 'complete-btn'}`}
                                  title={release.isCompleted ? "Mark as not released" : "Mark as released"}
                                >
                                  {release.isCompleted ? "↩" : <FontAwesomeIcon icon={faCheck} />}
                                </button>
                                <button 
                                  onClick={() => deleteRelease(release.id)}
                                  className="action-btn delete-btn"
                                  title="Delete"
                                >
                                  <FontAwesomeIcon icon={faEraser} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </>
                )}

                {/* Releasing in the next Year */}
                {searchedReleases.some(release => {
                  const days = calculateDaysUntil(release.releaseDate);
                  return days <= 0;
                }) && (
                  <>
                    <div className="releases-header">
                      <h2 className="releases-title">Past</h2>
                    </div>
                  
                    {searchedReleases.map(release => {
                      const daysUntil = calculateDaysUntil(release.releaseDate);
                      const typeColor = getTypeColor(release.type);
                      const typeGradient = getTypeGradient(release.type);
                      const statusColor = getStatusColor(release.releaseDate, release.isCompleted);
                      
                      // Render release item
                      if (daysUntil <= 0) {
                        return (
                          <div 
                            key={release.id} 
                            className={`release-item ${release.isCompleted ? 'completed' : ''} zoom`}
                            style={{ 
                              borderLeftColor: typeColor, background: `linear-gradient(to left, ${typeGradient} 10%, #15171f 30%)`
                            }}
                            onClick={() => setViewingRelease(release)}
                          >
                            <div className="release-content">
                              <div className="release-header">
                                <div className="status-dot" style={{ backgroundColor: statusColor }}></div>
                                <h3 className="release-title">{release.title} <span className='release-artist'>{release.artist}</span></h3>
                              </div>
                              
                              <div className="release-details">
                                <div className="detail-row">
                                  <span className="detail-label">Type:</span>
                                  <span className="detail-value" style={{ color: typeColor }}>{release.type}</span>
                                </div>
                                
                                <div className="detail-row">
                                  <span className="detail-label">Release:</span>
                                  <div className="release-date-info">
                                    <span>{new Date(release.releaseDate).toLocaleDateString('en-GB')}</span>
                                    {daysUntil > 0 && (
                                      <span className="day-count" style={{ color: statusColor }}>
                                        {daysUntil} day{daysUntil !== 1 ? 's' : ''} remaining
                                      </span>
                                    )}
                                    {daysUntil === 0 && (
                                      <span className="today-indicator">TODAY!</span>
                                    )}
                                    {daysUntil < 0 && (
                                      <span className="day-count" style={{ color: statusColor }}>
                                        {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''} ago
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {release.notes && (
                                  <div className="detail-row">
                                    <span className="detail-label">Notes:</span>
                                    <span className="detail-value">{release.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="release-divider">
                              {release.anticipation > 0 && (
                                <div className="anticipation-info">
                                  <FontAwesomeIcon icon={faSmile} />
                                  <span className="anticipation-value">{release.anticipation}/10</span>
                                </div>
                              )}
                              <div className="release-actions">
                                <button 
                                  onClick={() => toggleComplete(release.id)}
                                  className={`action-btn ${release.isCompleted ? 'undo-btn' : 'complete-btn'}`}
                                  title={release.isCompleted ? "Mark as not released" : "Mark as released"}
                                >
                                  {release.isCompleted ? "↩" : <FontAwesomeIcon icon={faCheck} />}
                                </button>
                                <button 
                                  onClick={() => deleteRelease(release.id)}
                                  className="action-btn delete-btn"
                                  title="Delete"
                                >
                                  <FontAwesomeIcon icon={faEraser} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </>
                )}
              </>
            )}


          </div>
        </div>
        {viewingRelease !== null ? 
          <div className='viewing-section'>
            <div className='viewing-container'>
              <div className='viewing-header'>
                <h2 className='viewing-title'>{viewingRelease.title}</h2>
                <button onClick={() => setViewingRelease(null)} className='close-button' title='Close'><FontAwesomeIcon icon={faXmark} /></button>
              </div>
              <div className='viewing-content'>
                {viewingRelease.artist !== '' && <h3 className='viewing-artist '>{viewingRelease.artist}</h3>}
                <h3 className='viewing-type' style={{ color: getTypeColor(viewingRelease.type) }}>{viewingRelease.type}</h3>
                
              </div>
            </div>
          </div>
          :
          <div className="add-section">
          <h2 className="add-title">Add New Release</h2>
          <hr className='add-divider'/>
          <div className="form-field">
            <label title='What is it Called?'>Title</label>
            <input
              type="text"
              name="title"
              value={newRelease.title}
              onChange={handleInputChange}
              placeholder="Enter Title"
              className="dark-input"
            />
          </div>
          
          <div className="form-field">
            <label title='Which category is it?'>Type</label>
            <select
              name="type"
              value={newRelease.type}
              onChange={handleInputChange}
              className="dark-select"
            >
              <option value="Game">Game</option>
              <option value="Movie">Movie</option>
              <option value="Music">Music</option>
              <option value="Book">Book</option>
              <option value="TV-Show">TV Show</option>
              <option value="Other">Other</option>
            </select>
          </div>


          
          <div className="form-field">
            <label title='Release Date of the media'>Date</label>
            <input
              type="date"
              name="releaseDate"
              value={newRelease.releaseDate}
              onChange={handleInputChange}
              className="dark-input date-input"
            />
            {/* For if the user doesn't know the release date */}
            <button onClick={handleNoDate(newRelease)} className='no-date-button'>No Date</button>

          </div>
          {isMusic ? (
            <div className="form-field">
              <label title='Song Artist'>Artist</label>
              <input
                type="text"
                name="artist"
                value={newRelease.artist}
                onChange={handleInputChange}
                placeholder="Enter Artist"
                className="dark-input"
              />
            </div>
          ) : null}
          <div className="form-field">
            <label title='Any Extra Info? (Optional)'>Notes</label>
            <input
              type="text"
              name="notes"
              value={newRelease.notes}
              onChange={handleInputChange}
              placeholder="Enter Notes"
              className="dark-input"
            />
          </div>

          <div className="form-field">
            <label title="How excited are you about this?">Anticipation</label>
            <div style={{ display: 'flex', alignItems: 'center' }} className='range-container'>
              <input type="range" min={0} max={10} value={newRelease.anticipation} name="anticipation" onChange={handleInputChange} className="dark-range" />
              <span className="range-value">{newRelease.anticipation}</span>
            </div>
            
          </div>

          <button 
            onClick={addRelease}
            className="add-button"
            disabled={!newRelease.title || !newRelease.releaseDate}
          >
            Add to Tracker
          </button>
        </div>
        }
        
      </div>
      {/*Timeline Overlay*/}
      <div className="timeline-overlay" style={{ display: showTimeline ? 'block' : 'none' }}>
        <div className="timeline-content">
          <div className="timeline-header">
            <h1 className='timeline-title'>Your Timeline</h1>
            <button className="timeline-close" onClick={() => setShowTimeline(false)}><FontAwesomeIcon icon={faXmark} /></button>
          </div>
          <div className="timeline-body">
            <div className='timeline-line'></div>
            {releases.map((release) => {
              const typeColor = getTypeColor(release.type);
              const year = new Date(release.releaseDate).getFullYear();
              const daysSinceJan = release.releaseDate ? Math.floor((new Date(release.releaseDate).getTime() - new Date(`${year}-01-01`).getTime()) / (1000 * 60 * 60 * 24)) : 0;
              const x = ((daysSinceJan / 365) * (window.innerWidth*0.9*0.8)) + (window.innerWidth*0.05*0.8);
              return (
                <>
                  <Dot x={x} release={release} setVisibleRelease={setVisibleRelease} typeColor={typeColor} />
                  <InfoBox x={x} text={release.title} />
                </>
              );
            })}
            {months.map((month) => {
              const x = ((months.indexOf(month) / 12) * (window.innerWidth*0.9*0.8)) + (window.innerWidth*0.05*0.8);
              return (
                <Line x={x} />
              );
            })}
            <Dot x={currentX} type={'now'}  />
            <InfoBox x={currentX} text={`${formattedDate}`} show={true} />
            {/*CanvasGrid*/}
          </div>
          <div className="timeline-info">
            <p className="timeline-info-title">{visibleRelease.title}</p>
            <hr className='timeline-info-divider'/>
            <p className="timeline-info-type">Type: <span className='timeline-info-type-text'>{visibleRelease.type}</span></p>
            <p className="timeline-info-date">Date: <span className='timeline-info-date-text'>{visibleRelease.releaseDate}</span></p>
            <div className="timeline-info-notes">
              <p>{visibleRelease.notes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaReleaseTracker;