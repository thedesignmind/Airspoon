'use client';

interface LocationPermissionProps {
  isRequesting: boolean;
  onAllow: () => void;
  onSkip: () => void;
}

export default function LocationPermission({
  isRequesting,
  onAllow,
  onSkip,
}: LocationPermissionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 text-center">
      <div className="text-5xl mb-4">📍</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Allow Location Access</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
        Airspoon uses your location to find restaurants near you. Click below to
        enable, or use our default location in Waltham, MA.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onAllow}
          disabled={isRequesting}
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold px-6 py-3 rounded-full transition-colors duration-200 shadow-md shadow-emerald-200"
        >
          {isRequesting ? (
            <>
              <span className="animate-spin">⟳</span> Requesting...
            </>
          ) : (
            <>📍 Allow Location</>
          )}
        </button>
        <button
          onClick={onSkip}
          disabled={isRequesting}
          className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-semibold px-6 py-3 rounded-full transition-colors duration-200"
        >
          📌 Use Default Location
        </button>
      </div>
    </div>
  );
}
