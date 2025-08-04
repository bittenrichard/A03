// Local: /a03/src/shared/services/webhookService.ts

// CORREÇÃO: Importa a função específica que ele precisa.
import { sendToBaserow } from './baserowServerClient';
// CORREÇÃO: Importa o tipo Candidate do local correto.
import { Candidate } from '../types';

export const processAndStoreCandidate = async (
    files: Express.Multer.File[],
    jobId: string,
    userId: string
): Promise<Candidate[]> => {
    console.log('Iniciando processamento de candidatos via webhook...');
    const createdCandidates: Candidate[] = [];

    for (const file of files) {
        try {
            const formData = new FormData();
            const fileBlob = new Blob([file.buffer], { type: file.mimetype });
            formData.append('file', fileBlob, file.originalname);
            formData.append('jobId', jobId);
            formData.append('userId', userId);
            
            const webhookUrl = process.env.N8N_TRIAGEM_WEBHOOK_URL;
            if (!webhookUrl) {
                throw new Error('N8N_TRIAGEM_WEBHOOK_URL não está definida no .env');
            }

            console.log(`Enviando ${file.originalname} para o webhook de triagem...`);
            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro no webhook de triagem: ${response.statusText} - ${errorText}`);
            }

            const processedCandidate = await response.json();
            
            const candidateDataToSave = {
                "nome": processedCandidate.name,
                "email": processedCandidate.email,
                "telefone": processedCandidate.phone,
                "resumo_ia": processedCandidate.summary,
                "score": processedCandidate.score,
                "vaga_associada": [parseInt(jobId)],
                "curriculo": [{ url: processedCandidate.resume_url }] 
            };
            
            // CORREÇÃO: Usa a função importada 'sendToBaserow'
            const newCandidateRecord = await sendToBaserow(process.env.BASEROW_CANDIDATES_TABLE_ID || '', candidateDataToSave);
            createdCandidates.push(newCandidateRecord as Candidate);

        } catch (error) {
            console.error(`Falha ao processar o arquivo ${file.originalname}:`, error);
        }
    }

    console.log('Processamento de candidatos via webhook finalizado.');
    return createdCandidates;
};