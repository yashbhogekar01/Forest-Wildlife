import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SidebarNav from './components/SidebarNav';
import LoginPage from './components/LoginPage';
import AiTigerAssistant from './components/AiTigerAssistant';
import DashboardOverview from './pages/DashboardOverview';
import CameraTrapImages from './pages/CameraTrapImages';
import TigerDatabase from './pages/TigerDatabase';
import TigerOccupancyModule from './pages/TigerOccupancyModule';
import DeviationAlertsModule from './pages/DeviationAlertsModule';
import MovementMap from './pages/MovementMap';
import AlertsIncidents from './pages/AlertsIncidents';
import ReportsExports from './pages/ReportsExports';
import HumanReviewQueue from './pages/HumanReviewQueue';
import CaptureSimulationModal from './components/CaptureSimulationModal';
import ThreatConditionModal from './components/ThreatConditionModal';
import AnimalDetailModal from './components/AnimalDetailModal';
import UploadCameraTrapModal from './components/UploadCameraTrapModal';
import PhotoViewerModal from './components/PhotoViewerModal';
import VillageProximityAlarm from './components/VillageProximityAlarm';
import FloatingIdentifyButton from './components/FloatingIdentifyButton';

import {
  fetchStats,
  fetchStations,
  fetchSightings,
  fetchTigers,
  fetchAlerts,
  fetchReports,
  fetchWeather
} from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ptr_logged_user');
    return saved ? JSON.parse(saved) : {
      id: 'PTR-MH-OFFICER-01',
      name: 'Dr. Rajesh Sharma (RFO)',
      role: 'Officer',
      sector: 'Pench Tiger Reserve - Maharashtra'
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  const [stats, setStats] = useState(null);
  const [stations, setStations] = useState([]);
  const [sightings, setSightings] = useState([]);
  const [tigers, setTigers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [weather, setWeather] = useState(null);

  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [activeAlertModal, setActiveAlertModal] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedSighting, setSelectedSighting] = useState(null);
  const [selectedLiveTigerId, setSelectedLiveTigerId] = useState(null);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('ptr_logged_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ptr_logged_user');
  };

  const loadData = async () => {
    try {
      const [stData, staData, sgData, tgData, alData, rpData, wtData] = await Promise.all([
        fetchStats(),
        fetchStations(),
        fetchSightings(),
        fetchTigers(),
        fetchAlerts(),
        fetchReports(),
        fetchWeather()
      ]);

      setStats(stData);
      setStations(staData);
      setSightings(sgData);
      setTigers(tgData);
      setAlerts(alData);
      setReports(rpData);
      setWeather(wtData);
    } catch (err) {
      console.error('Error fetching telemetry data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s telemetry refresh
    return () => clearInterval(interval);
  }, []);

  const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'INVESTIGATING').length;

  if (!currentUser) {
    return (
      <div className="h-screen forest-canvas-bg flex flex-col font-sans overflow-hidden">
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="h-screen forest-canvas-bg text-slate-800 flex flex-col font-sans selection:bg-emerald-600 selection:text-white overflow-hidden">
      
      {/* Header */}
      <Header
        tigers={tigers}
        activeAlertsCount={activeAlertsCount}
        onOpenSimulation={() => setShowSimulationModal(true)}
        onOpenUpload={() => setShowUploadModal(true)}
        onSelectAnimal={tiger => setSelectedAnimal(tiger)}
        weather={weather}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAiAssistant={() => setShowAiAssistant(true)}
      />

      {/* Village Proximity Warning & Alarm Siren System */}
      <VillageProximityAlarm
        alerts={alerts}
        onSelectAlert={alert => setActiveAlertModal(alert)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigation */}
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeAlertsCount={activeAlertsCount}
          onOpenAiAssistant={() => setShowAiAssistant(true)}
        />

        {/* View Content Panel */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              stats={stats}
              stations={stations}
              sightings={sightings}
              tigers={tigers}
              alerts={alerts}
              weather={weather}
              onOpenUpload={() => setShowUploadModal(true)}
              onSelectAlert={alert => setActiveAlertModal(alert)}
              onSelectTiger={tiger => setSelectedAnimal(tiger || tigers[0])}
              onSelectSighting={sighting => setSelectedSighting(sighting)}
              onViewAllCaptures={() => setActiveTab('captures')}
              onViewAllTigers={() => setActiveTab('tigers')}
              onViewAllAlerts={() => setActiveTab('alerts')}
            />
          )}

          {activeTab === 'captures' && (
            <CameraTrapImages
              sightings={sightings}
              stations={stations}
              tigers={tigers}
              onOpenUpload={() => setShowUploadModal(true)}
              onSelectAnimal={tiger => setSelectedAnimal(tiger)}
              onSelectSighting={sighting => setSelectedSighting(sighting)}
            />
          )}

          {activeTab === 'tigers' && (
            <TigerDatabase
              tigers={tigers}
              sightings={sightings}
              onSelectAnimal={tiger => setSelectedAnimal(tiger)}
              onOpenMapWithTiger={() => setActiveTab('map')}
              onDataChanged={loadData}
            />
          )}

          {activeTab === 'occupancy' && (
            <TigerOccupancyModule
              tigers={tigers}
              sightings={sightings}
              stations={stations}
              onSelectAnimal={tiger => setSelectedAnimal(tiger)}
              onOpenMap={() => setActiveTab('map')}
            />
          )}

          {activeTab === 'deviation' && (
            <DeviationAlertsModule
              alerts={alerts}
              tigers={tigers}
              stations={stations}
              onAlertSaved={loadData}
            />
          )}

          {activeTab === 'map' && (
            <MovementMap
              stations={stations}
              sightings={sightings}
              tigers={tigers}
              initialTigerId={selectedLiveTigerId}
              onSelectAnimal={tiger => setSelectedAnimal(tiger)}
              onPingSuccess={loadData}
              weather={weather}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsIncidents
              alerts={alerts}
              onAlertSaved={loadData}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsExports
              reports={reports}
              onReportGenerated={loadData}
            />
          )}

          {activeTab === 'reviews' && (
            <HumanReviewQueue
              onSelectTiger={tiger => setSelectedAnimal(tiger)}
              onViewLocationOnMap={(tiger, station) => {
                if (tiger?.id) setSelectedLiveTigerId(tiger.id);
                setActiveTab('map');
              }}
            />
          )}
        </main>
      </div>

      {/* Illuminated Orange Floating AI Identification Button */}
      <FloatingIdentifyButton
        onClick={() => setShowUploadModal(true)}
      />

      {/* Sighting Photo Detail Modal */}
      {selectedSighting && (
        <PhotoViewerModal
          sighting={selectedSighting}
          tiger={tigers.find(t => t.id === selectedSighting.tiger_id)}
          onClose={() => setSelectedSighting(null)}
          onSelectTiger={tiger => setSelectedAnimal(tiger)}
        />
      )}

      {/* Animal Detail Inspector Modal */}
      {selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          sightings={sightings}
          onClose={() => setSelectedAnimal(null)}
          onOpenMapWithTiger={(tiger) => {
            setSelectedAnimal(null);
            if (tiger?.id) {
              setSelectedLiveTigerId(tiger.id);
            }
            setActiveTab('map');
          }}
        />
      )}

      {/* Upload Camera Trap Image Modal */}
      {showUploadModal && (
        <UploadCameraTrapModal
          stations={stations}
          tigers={tigers}
          onClose={() => setShowUploadModal(false)}
          onSuccess={loadData}
          onViewLocationOnMap={(tiger, station) => {
            setShowUploadModal(false);
            if (tiger?.id) {
              setSelectedLiveTigerId(tiger.id);
            }
            setActiveTab('map');
          }}
          onViewTigerProfile={(tiger) => {
            setShowUploadModal(false);
            if (tiger) setSelectedAnimal(tiger);
          }}
        />
      )}

      {/* Capture Simulation Modal */}
      {showSimulationModal && (
        <CaptureSimulationModal
          stations={stations}
          tigers={tigers}
          onClose={() => setShowSimulationModal(false)}
          onSuccess={loadData}
        />
      )}

      {/* Threat Condition Modal */}
      {activeAlertModal && (
        <ThreatConditionModal
          alert={activeAlertModal}
          onClose={() => setActiveAlertModal(null)}
          onSaveSuccess={loadData}
        />
      )}

      {/* Maya AI Telemetry & Travel Intelligence Assistant Modal */}
      <AiTigerAssistant
        tigers={tigers}
        sightings={sightings}
        stations={stations}
        isOpen={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
        onSelectTiger={(tiger) => setSelectedAnimal(tiger)}
      />

    </div>
  );
}

