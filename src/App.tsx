import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Display } from './components/Display';
import { Controller } from './components/Controller';
import { DisplaySelector } from './components/DisplaySelector';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">
          BJJ Scoreboard
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Choose your view
        </p>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <Link
            to="/display"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-12 rounded-lg text-2xl transition transform hover:scale-105"
          >
            Display View
            <div className="text-sm font-normal mt-2">For big screens</div>
          </Link>
          <Link
            to="/controller"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-12 rounded-lg text-2xl transition transform hover:scale-105"
          >
            Controller View
            <div className="text-sm font-normal mt-2">Control the scoreboard</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/display" element={<Display />} />
        <Route path="/controller" element={<DisplaySelector />} />
        <Route path="/controller/:displayId" element={<Controller />} />
      </Routes>
    </Router>
  );
}

export default App;

