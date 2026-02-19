import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for consistent tailwind classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UploadDropzoneProps {
    onFileUpload: (file: File) => void;
    isLoading?: boolean;
}

export function UploadDropzone({ onFileUpload, isLoading = false }: UploadDropzoneProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsHovering(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsHovering(false);
    };

    const processFile = useCallback((file: File) => {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.vcf')) {
            setError('Please upload a valid .vcf file.');
            setSelectedFile(null);
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit example
            setError('File is too large. Please upload a file smaller than 50MB.');
            setSelectedFile(null);
            return;
        }

        setError(null);
        setSelectedFile(file);
        // You could immediately start upload here, or wait for user to click a 'Submit' button
        // Let's immediately process for a smoother experience or pass to parent
        onFileUpload(file);
    }, [onFileUpload]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsHovering(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            {!selectedFile || error ? (
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[300px]",
                        isHovering ? "border-blue-500 bg-blue-50/50" : "border-slate-300 bg-slate-50/50 hover:bg-slate-100 hover:border-blue-400",
                        error && "border-red-400 bg-red-50/50 hover:border-red-500"
                    )}
                >
                    <input
                        type="file"
                        accept=".vcf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Upload VCF file"
                        disabled={isLoading}
                    />

                    <div className={cn(
                        "p-4 rounded-full mb-4 shadow-sm transition-colors",
                        isHovering ? "bg-blue-100 text-blue-600" : "bg-white text-slate-500 shadow-slate-200/50"
                    )}>
                        <UploadCloud className="w-10 h-10" />
                    </div>

                    <h3 className="text-xl font-semibold mb-2 text-slate-800">
                        {isHovering ? 'Drop your file here' : 'Upload VCF File'}
                    </h3>

                    <p className="text-slate-500 mb-6 max-w-sm text-sm">
                        Drag and drop your complete patient <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">.vcf</code> genotype file here, or click to browse.
                    </p>

                    <button className={cn(
                        "font-medium py-2.5 px-6 rounded-full transition-all shadow-sm",
                        "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md",
                        isLoading && "opacity-50 cursor-not-allowed"
                    )}>
                        Select File
                    </button>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                            className="mt-6 flex items-center gap-2 text-red-600 bg-red-100/50 px-4 py-2 rounded-lg text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6"
                >
                    <div className="bg-blue-100 p-4 rounded-xl text-blue-600 shrink-0">
                        <File className="w-8 h-8" />
                    </div>

                    <div className="flex-grow text-center md:text-left">
                        <h4 className="font-semibold text-slate-800 text-lg">{selectedFile.name}</h4>
                        <p className="text-slate-500 text-sm mt-1">{formatFileSize(selectedFile.size)} • VCF Document</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                        {isLoading ? (
                            <div className="flex items-center gap-3 px-6 py-2.5 bg-blue-50 text-blue-700 rounded-full w-full justify-center">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="font-medium inline-block min-w-[100px]">Analyzing...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Ready
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                                    aria-label="Remove file"
                                    title="Remove file"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
