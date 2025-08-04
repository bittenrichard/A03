// Local: /a03/src/shared/services/webhookService.ts

import { sendToBaserow } from './baserowServerClient';
import { Candidate } from '../types'; // Corrigido para usar o types compartilhado

export const processAndStoreCandidate = async (
    files: Express.Multer.File[],
    jobId: string,
    userId: string
): Promise<Candidate[]> => { // Adicionado o tipo de retorno e a palavra-chave async
    console.log('Iniciando processamento de candidatos...');
    const createdCandidates: Candidate[] = [];

    for (const file of files) {
        try {
            const formData = new FormData();
            formData.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
            formData.append('jobId', jobId);
            formData.append('userId', userId);
            
            // Simulação de chamada para um webhook externo que processa o CV
            // Substitua pela sua URL de webhook real
            const webhookUrl = process.env.N8N_TRIAGEM_WEBHOOK_URL;
            if (!webhookUrl) {
                throw new Error('N8N_TRIAGEM_WEBHOOK_URL não está definida no .env');
            }

            console.log(`Enviando ${file.originalname} para o webhook...`);
            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro no webhook: ${response.statusText} - ${errorText}`);
            }

            const processedCandidate = await response.json();
            console.log(`Candidato processado recebido do webhook:`, processedCandidate);

            // Armazenar no Baserow (exemplo simplificado)
            // Adapte conforme a estrutura da sua tabela de candidatos
            const candidateDataToSave = {
                nome: processedCandidate.name,
                email: processedCandidate.email,
                telefone: processedCandidate.phone,
                resumo_ia: processedCandidate.summary,
                score: processedCandidate.score,
                vaga_associada: [parseInt(jobId)], // Exemplo de como associar a vaga
                curriculo: [{ url: processedCandidate.resume_url }] // Exemplo
            };

            const newCandidateRecord = await sendToBaserow(process.env.BASEROW_CANDIDATES_TABLE_ID || '', candidateDataToSave);
            createdCandidates.push(newCandidateRecord as Candidate);

        } catch (error) {
            console.error(`Falha ao processar o arquivo ${file.originalname}:`, error);
            // Continue para o próximo arquivo em caso de erro
        }
    }

    console.log('Processamento de candidatos finalizado.');
    return createdCandidates; // Adicionado o retorno
};