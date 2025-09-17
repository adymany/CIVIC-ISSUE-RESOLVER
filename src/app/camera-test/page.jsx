'use client';

import { useState, useRef } from 'react';

export default function CameraTest() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  const startCamera = async () => {
    try {
      setError('');
      
      // Stop any existing stream
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
      }
      
      // Simple camera access with basic constraints
      const constraints = { video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Set the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera: ' + (err.message || 'Unknown error'));
    }
  };

  const captureImage = () => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        setError('Camera not initialized properly.');
        return;
      }
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL and set as image
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImage(dataUrl);
      
      // Stop the camera
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
        streamRef.current = null;
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      setError('Failed to capture image: ' + (error.message || 'Unknown error'));
    }
  };

  const clearImage = () => {
    setImage(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Camera Test</h1>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Camera Test</h2>
          
          {image ? (
            <div className="mb-4">
              <img src={image} alt="Captured" className="w-full object-cover rounded-xl border border-gray-300 dark:border-gray-600" style={{ height: '400px' }} />
              <button
                type="button"
                onClick={clearImage}
                className="mt-2 btn-pill btn-secondary"
              >
                Take Another Photo
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full object-cover rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700"
                style={{ height: '400px' }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
          
          {!image && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={startCamera}
                className="btn-pill btn-primary-gradient"
              >
                Start Camera
              </button>
              <button
                type="button"
                onClick={captureImage}
                className="btn-pill bg-secondary-green text-white shadow-medium hover:shadow-large"
              >
                Capture Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}