import axios from 'axios';

// In production, use the absolute Vercel URL to avoid path resolution errors.
// In production (Render/Docker), the API and Frontend share the same domain, so use a relative path ('')
// In local dev, use http://localhost:8000 (FastAPI default)
const API_BASE_URL = import.meta.env.MODE === 'production' ? '' : 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface PhenotypePrediction {
    gene: string;
    diplotype: string;
    phenotype: string;
    phenotype_full: string;
    activity_score: number;
    confidence: number;
}

export interface DrugRiskAssessment {
    drug: string;
    gene: string;
    risk_category: string; // Safe | Adjust Dosage | Toxic | Ineffective | Unknown
    severity: string;
    confidence_score: number;
    cpic_guideline: string;
    recommendation_brief: string;
    mechanism?: string;
}

export interface VariantCitation {
    variant: string;
    pmid?: string;
    note: string;
}

export interface LLMAnalysis {
    clinical_summary: string;
    mechanism_explanation: string;
    dosing_recommendations: string[];
    variant_citations: VariantCitation[];
    llm_model_used: string;
    llm_confidence: number;
}

export interface VCFMetadata {
    file_name: string;
    vcf_version: string;
    total_variants: number;
    pgx_variants_found: number;
}

export interface OverallRisk {
    level: string;
    flags: string[];
}

export interface PRABALResponse {
    status: string;
    patient_id?: string;
    analysis_timestamp: string;
    vcf_metadata: VCFMetadata;
    // detected_variants: any[];
    phenotype_predictions: PhenotypePrediction[];
    drug_risk_assessments: DrugRiskAssessment[];
    llm_analysis: LLMAnalysis | null;
    overall_risk: OverallRisk;
    processing_time_ms: number;
}

export const PrabalAPI = {
    /**
     * Check if backend is running
     */
    checkHealth: async () => {
        const response = await apiClient.get('/api/v1/health');
        return response.data;
    },

    /**
     * Upload VCF file and drugs to get the PRABAL report
     */
    uploadVcf: async (file: File, drugs: string): Promise<PRABALResponse> => {
        const formData = new FormData();
        formData.append('vcf_file', file);
        formData.append('drugs', drugs);

        // Using multipart/form-data for file upload
        const response = await apiClient.post<PRABALResponse>('/api/v1/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }
};
