"use client";

export default function OfflineFallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 text-center text-white">
      <div className="max-w-md space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800">
          <svg
            className="h-10 w-10 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-3.536 5 5 0 015.657-4.95m0 0l2.829 2.829M12 12v.01M12 12a1 1 0 100-2 1 1 0 000 2z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">You&apos;re Offline</h1>
          <p className="text-neutral-400">
            Please check your network connection. In the meantime, you can continue viewing cached reports and queued offline requests.
          </p>
        </div>
        <div className="pt-4">
          <button
            onClick={() => typeof window !== "undefined" && window.location.reload()}
            className="rounded bg-indigo-600 px-6 py-2 text-sm font-semibold hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
}
