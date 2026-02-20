import { useState } from 'react';
import { UploadDropzone } from '../components/UploadDropzone';
import { ReportView } from '../components/ReportView';
import { PrabalAPI } from '../api';
import type { PRABALResponse } from '../api';
import { AlertCircle, Pill } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Dashboard() {
    const [report, setReport] = useState<PRABALResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [drugs, setDrugs] = useState<string>('codeine,warfarin');

    const handleFileUpload = async (file: File) => {
        if (!drugs.trim()) {
            setError("Please specify at least one drug name.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setReport(null);

        try {
            const result = await PrabalAPI.uploadVcf(file, drugs);
            setReport(result);
        } catch (err: any) {
            console.error("Upload failed", err);
            const message = err.response?.data?.detail?.[0]?.msg
                || err.response?.data?.detail
                || "Failed to connect to backend or process the VCF file. Ensure the FastAPI server is running.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-8 min-h-[calc(100vh-64px)] max-w-7xl mx-auto">

            {/* Hero Header */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 mb-10 shadow-2xl shadow-indigo-900/20">
                {/* Decorative glows */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl shrink-0 self-start">
                        <svg className="w-10 h-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold uppercase tracking-widest text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/20">
                                AI-Powered Clinical Tool
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            PRABAL
                            <span className="block text-xl md:text-2xl font-semibold mt-1 text-blue-300">
                                Pharmacogenomic Risk Management Tool
                            </span>
                        </h1>
                        <p className="text-slate-300 max-w-2xl text-sm md:text-base mt-3 leading-relaxed">
                            Upload patient VCF data and specify target medications to receive an AI-powered clinical narrative, drug risk assessment, and CPIC guidelines in seconds.
                        </p>
                    </div>
                </div>
            </div>

            {/* Inputs Section */}
            <div className="flex flex-col gap-4">

                <div className="bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6 flex flex-col md:flex-row gap-4 md:items-center">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl text-white shrink-0 self-start md:self-auto shadow-md shadow-blue-500/25">
                        <Pill className="w-6 h-6" />
                    </div>
                    <div className="flex-grow">
                        <label htmlFor="drugs" className="block text-sm font-semibold text-slate-800 mb-1.5">Target Medications</label>
                        <input
                            id="drugs"
                            type="text"
                            value={drugs}
                            onChange={(e) => setDrugs(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 block p-3 transition-all outline-none placeholder:text-slate-400"
                            placeholder="e.g. codeine, warfarin, clopidogrel"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-slate-400 mt-2">Comma-separated list of drugs to analyze against the patient's genotype.</p>
                    </div>
                </div>

                <UploadDropzone onFileUpload={handleFileUpload} isLoading={isLoading} />
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-start gap-3 shadow-sm overflow-hidden"
                    >
                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        <div className="text-sm font-medium pr-2 pb-2">{error}</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Section */}
            <AnimatePresence>
                {report && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        key="report-view"
                    >
                        <ReportView report={report} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
