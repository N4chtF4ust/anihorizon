'use client';

export default function NotFound() {
  const handleReturnHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-6xl font-bold text-sky-300 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-lg mb-6 text-gray-300">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <button
        onClick={handleReturnHome}
        className="bg-sky-300 text-black px-6 py-2 rounded-lg hover:bg-sky-500 transition"
      >
        Return Home
      </button>
    </div>
  );
}
