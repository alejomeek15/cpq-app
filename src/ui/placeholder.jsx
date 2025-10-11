import React from 'react';

const ArrowLeft = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

const Placeholder = ({ title, navigate }) => (
    <main className="container mx-auto p-4 md:p-8">
        <button onClick={() => navigate('dashboard')} className="flex items-center gap-2 text-sm text-indigo-500 hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Volver al Panel
        </button>
        <header className="text-center mb-10">
            <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{title}</h1>
            <p className="text-lg mt-2 text-gray-600 dark:text-gray-400">Esta sección se construirá en los próximos pasos.</p>
        </header>
    </main>
);

export default Placeholder;
