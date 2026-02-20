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
                "p-5 rounded-2xl border flex flex-col gap-3 relative overflow-hidden",
                "shadow-sm hover:shadow-md transition-shadow",
                isDanger ? "bg-red-50/70 border-red-200" : isSafe ? "bg-emerald-50/70 border-emerald-200" : "bg-amber-50/50 border-amber-200"
            )}
        >
            {/* Colored left accent bar */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl",
                isDanger ? "bg-red-400" : isSafe ? "bg-emerald-400" : "bg-amber-400"
            )} />
            <div className="flex justify-between items-start pl-2">
                <h4 className="font-bold text-lg text-slate-900 capitalize">{risk.drug}</h4>
                {isDanger ? (
                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                ) : isSafe ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                )}
            </div>
            <div className="flex items-center gap-2 flex-wrap pl-2">
                <span className={cn(
                    "px-2.5 py-1 text-xs font-bold rounded-lg",
                    isDanger ? "bg-red-100 text-red-700" : isSafe ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                    {risk.risk_category}
                </span>
                <span className="text-xs text-slate-500 font-medium">via {risk.gene}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed pl-2">
                {risk.recommendation_brief}
            </p>
            {risk.cpic_guideline ? (
                <p className="text-xs text-slate-500 border-t border-slate-200/60 pt-2 mt-auto pl-2">
                    {risk.cpic_guideline}
                </p>
            ) : null}
        </motion.div>
    );
};

const GenotypePill = ({ summary }: { summary: PhenotypePrediction }) => (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2 rounded-lg shadow-sm shadow-indigo-300/30">
                <Dna className="w-4 h-4 text-white" />
            </div>
            <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{summary.gene}</p>
                <p className="font-semibold text-slate-900">{summary.diplotype}</p>
            </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
            <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-semibold",
                summary.phenotype?.toLowerCase().includes('poor') ? 'bg-red-100 text-red-700' :
                    summary.phenotype?.toLowerCase().includes('rapid') || summary.phenotype?.toLowerCase().includes('ultra') ? 'bg-purple-100 text-purple-700' :
                        summary.phenotype?.toLowerCase().includes('normal') ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-700'
            )}>
                {summary.phenotype}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Score: {summary.activity_score}</span>
        </div>
    </div>
);

export function ReportView({ report }: { report: PRABALResponse }) {
    if (!report) return null;

    const handleDownloadJson = () => {
        if (!report) return;

        // Transform PRABALResponse into the exact requested JSON schema
        const exportData = report.drug_risk_assessments.map(risk => {
            const phenotypeInfo = report.phenotype_predictions.find(p => p.gene === risk.gene);

            return {
                patient_id: report.patient_id || "PATIENT_XXX",
                drug: risk.drug,
                timestamp: report.analysis_timestamp,
                risk_assessment: {
                    risk_label: risk.risk_category,
                    confidence_score: risk.confidence_score,
                    severity: risk.severity
                },
                pharmacogenomic_profile: {
                    primary_gene: risk.gene,
                    diplotype: phenotypeInfo?.diplotype || "Unknown",
                    phenotype: phenotypeInfo?.phenotype || "Unknown",
                    // detected_variants: report.detected_variants || [] // Add back if variants are included in response
                },
                clinical_recommendation: {
                    recommendation_brief: risk.recommendation_brief,
                    cpic_guideline: risk.cpic_guideline,
                    mechanism: risk.mechanism || ""
                },
                llm_generated_explanation: {
                    summary: report.llm_analysis?.clinical_summary || "",
                    dosing_recommendations: report.llm_analysis?.dosing_recommendations || [],
                    model_used: report.llm_analysis?.llm_model_used || ""
                },
                quality_metrics: {
                    vcf_parsing_success: true,
                    processing_time_ms: report.processing_time_ms,
                    total_variants_parsed: report.vcf_metadata.total_variants,
                    pgx_variants_found: report.vcf_metadata.pgx_variants_found
                }
            };
        });

        // Create blob and force download
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prabal_report_${report.patient_id || 'patient'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-10 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">

            {/* VCF Metadata & Overall Risk Card */}
            <div className="p-6 rounded-3xl border bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white flex flex-col lg:flex-row gap-6 items-center justify-between shadow-2xl shadow-slate-900/20">
                <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Analysis Complete</p>
                    <h2 className="text-2xl font-bold mb-1 flex flex-wrap items-center gap-3">
                        Overall Risk:
                        <span className={cn(
                            "px-4 py-1.5 rounded-xl text-lg font-black uppercase tracking-wide",
                            report.overall_risk.level === 'critical' ? 'bg-red-500/25 text-red-300 ring-2 ring-red-500/40 animate-pulse' :
                                report.overall_risk.level === 'high' ? 'bg-orange-500/25 text-orange-300 ring-1 ring-orange-400/40' :
                                    'bg-emerald-500/20 text-emerald-300'
                        )}>{report.overall_risk.level}</span>
                    </h2>
                    <p className="text-slate-400 text-sm mt-2">Processed {report.vcf_metadata.total_variants.toLocaleString()} variants in {report.processing_time_ms}ms.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                    <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-md border border-white/10">
                        <div className="text-3xl font-black">{report.vcf_metadata.pgx_variants_found}</div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">PGx Variants</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-md border border-white/10">
                        <div className="text-3xl font-black">{report.drug_risk_assessments.length}</div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">Drugs Analyzed</div>
                    </div>
                    <button
                        onClick={handleDownloadJson}
                        className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl px-5 py-4 flex items-center justify-center gap-2 transition-all font-bold shadow-lg shadow-blue-500/30 whitespace-nowrap"
                    >
                        <FileText className="w-5 h-5" />
                        Export JSON
                    </button>
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
