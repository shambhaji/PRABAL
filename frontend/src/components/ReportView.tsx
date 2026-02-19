import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, AlertTriangle, FileText, Dna, Activity } from 'lucide-react';
import type { PRABALResponse, DrugRiskAssessment, PhenotypePrediction } from '../api';
import { cn } from './UploadDropzone';

const RiskCard = ({ risk }: { risk: DrugRiskAssessment }) => {
    const isDanger = risk.risk_category === 'Toxic' || risk.risk_category === 'Adjust Dosage' || risk.risk_category === 'Ineffective';
    const isSafe = risk.risk_category === 'Safe';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "p-5 rounded-2xl border flex flex-col gap-3",
                isDanger ? "bg-red-50/50 border-red-200" : isSafe ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"
            )}
        >
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-slate-900 capitalize">{risk.drug}</h4>
                {isDanger ? (
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                ) : isSafe ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded-md",
                    isDanger ? "bg-red-100 text-red-700" : isSafe ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                    {risk.risk_category}
                </span>
                <span className="text-xs text-slate-500 font-medium">via {risk.gene}</span>
            </div>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed font-medium">
                {risk.recommendation_brief}
            </p>
            {risk.cpic_guideline ? (
                <p className="text-xs text-slate-500 border-t border-slate-200/60 pt-2 mt-auto">
                    {risk.cpic_guideline}
                </p>
            ) : null}
        </motion.div>
    );
};

const GenotypePill = ({ summary }: { summary: PhenotypePrediction }) => (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
                <Dna className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{summary.gene}</p>
                <p className="font-medium text-slate-900">{summary.diplotype}</p>
            </div>
        </div>
        <div className="text-right flex flex-col items-end">
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium mb-1">
                {summary.phenotype}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Score: {summary.activity_score}</span>
        </div>
    </div>
);

export function ReportView({ report }: { report: PRABALResponse }) {
    if (!report) return null;

    return (
        <div className="space-y-10 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">

            {/* VCF Metadata & Overall Risk Card */}
            <div className="p-6 rounded-3xl border bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col md:flex-row gap-6 items-center justify-between shadow-xl shadow-slate-900/10">
                <div>
                    <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                        Overall Assessment: <span className={cn(
                            "px-3 py-1 rounded-lg text-lg uppercase",
                            report.overall_risk.level === 'critical' || report.overall_risk.level === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                        )}>{report.overall_risk.level}</span>
                    </h2>
                    <p className="text-slate-400 text-sm">Processed {report.vcf_metadata.total_variants.toLocaleString()} variants in {report.processing_time_ms}ms.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-md">
                        <div className="text-2xl font-bold">{report.vcf_metadata.pgx_variants_found}</div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">PGx Variants</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-md">
                        <div className="text-2xl font-bold">{report.drug_risk_assessments.length}</div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Drugs Analyzed</div>
                    </div>
                </div>
            </div>

            {/* Genotype Summary Section */}
            <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Dna className="w-5 h-5 text-blue-600" /> Patient Genotype Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {report.phenotype_predictions.map((s, i) => (
                        <GenotypePill key={i} summary={s} />
                    ))}
                </div>
            </section>

            {/* Risk Assessment Section */}
            <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" /> Drug Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.drug_risk_assessments.map((risk, i) => (
                        <RiskCard key={i} risk={risk} />
                    ))}
                </div>
            </section>

            {/* Clinical Narrative Section */}
            {report.llm_analysis && (
                <section className="bg-white border text-sm md:text-base border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">AI Clinical Narrative</h3>
                            <p className="text-xs text-slate-500">Model: {report.llm_analysis.llm_model_used}</p>
                        </div>
                    </div>
                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">Clinical Summary</h4>
                            <p className="text-slate-700 leading-relaxed">{report.llm_analysis.clinical_summary}</p>
                        </div>

                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            <h4 className="text-lg font-bold text-blue-900 mb-3">Dosing Recommendations</h4>
                            <ul className="space-y-2">
                                {report.llm_analysis.dosing_recommendations.map((rec, i) => (
                                    <li key={i} className="flex gap-3 text-slate-700">
                                        <span className="text-blue-500 font-bold">•</span>
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">Mechanism Explanation</h4>
                            <p className="text-slate-700 leading-relaxed text-sm">{report.llm_analysis.mechanism_explanation}</p>
                        </div>

                        {report.llm_analysis.variant_citations && report.llm_analysis.variant_citations.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Citations & Notes</h4>
                                <div className="space-y-3">
                                    {report.llm_analysis.variant_citations.map((cit, i) => (
                                        <div key={i} className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <span className="font-mono font-medium text-slate-800 bg-white px-2 py-0.5 rounded border mr-2">{cit.variant}</span>
                                            {cit.note}
                                            {cit.pmid && <a href={`https://pubmed.ncbi.nlm.nih.gov/${cit.pmid}`} target="_blank" rel="noreferrer" className="ml-2 text-blue-500 hover:underline">PMID: {cit.pmid}</a>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
