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
        <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-64px)]">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-10 text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    Precision <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Pharmacogenomics</span>
                </h1>
                <p className="text-slate-500 max-w-2xl text-lg mx-auto md:mx-0">
                    Upload patient VCF data and specify target medications to receive an AI-powered clinical narrative, drug risk assessment, and CPIC guidelines in seconds.
                </p>
            </div>

            {/* Inputs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-4">

                    <div className="bg-white border text-blue-900 shadow-sm border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row gap-4 md:items-center">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600 shrink-0 self-start md:self-auto">
                            <Pill className="w-6 h-6" />
                        </div>
                        <div className="flex-grow">
                            <label htmlFor="drugs" className="block text-sm font-bold text-slate-700 mb-1">Target Medications</label>
                            <input
                                id="drugs"
                                type="text"
                                value={drugs}
                                onChange={(e) => setDrugs(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 transition-colors"
                                placeholder="e.g. codeine, warfarin, clopidogrel"
                                disabled={isLoading}
                            />
                            <p className="text-xs text-slate-500 mt-2">Comma-separated list of drugs to analyze against the patient's genotype.</p>
                        </div>
                    </div>

                    <div className="transition-all duration-500 w-full">
                        <UploadDropzone onFileUpload={handleFileUpload} isLoading={isLoading} />
                    </div>
                </div>
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
