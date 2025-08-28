import React from 'react';
import { useThoughts } from '../lib/stores/useThoughts';

const Galaxy: React.FC = () => {
  const { getSpheres, navigateToSphere, setViewMode } = useThoughts();
  const spheres = getSpheres();

  const handleSphereClick = (sphereId: string) => {
    console.log('Navigating to sphere:', sphereId);
    navigateToSphere(sphereId);
    setViewMode('sphere');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Galaxy Shelf
        </h1>
        
        {spheres.length === 0 ? (
          <div className="text-center text-gray-400 text-xl">
            No spheres stored yet. Create some thoughts first!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {spheres.map((sphere) => (
              <div
                key={sphere.sphereId}
                onClick={() => handleSphereClick(sphere.sphereId!)}
                className="bg-white/10 backdrop-blur-md rounded-lg p-6 cursor-pointer hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                    {sphere.title?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {sphere.title || 'Untitled Sphere'}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Click to edit this sphere
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Galaxy;
