import express, { Request, Response } from 'express';
import {
  evaluateAndStartQuestions,
  processAnswerAndGetNextQuestion,
  generateDebriefWithGemini,
  transcribeAudioWithGemini
} from './geminiService';

export const apiRouter = express.Router();
apiRouter.use(express.json({ limit: '25mb' }));

// Initial pitch evaluation & Start Turn-by-Turn Questioning
apiRouter.post('/pitch', async (req: Request, res: Response) => {
  try {
    const { pitch } = req.body;
    if (!pitch || !pitch.businessName) {
      return res.status(400).json({ error: 'Pitch data with businessName is required' });
    }

    const result = await evaluateAndStartQuestions(pitch);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error starting pitch evaluation:', err);
    res.status(500).json({ error: 'Failed to evaluate pitch', details: message });
  }
});

// Process an answered question and advance to the next Shark
apiRouter.post('/answer-question', async (req: Request, res: Response) => {
  try {
    const {
      pitch,
      answeredQuestion,
      userAnswerText,
      currentStatuses,
      currentScores,
      activeOffers
    } = req.body;

    if (!pitch || !answeredQuestion || !userAnswerText) {
      return res.status(400).json({ error: 'pitch, answeredQuestion, and userAnswerText are required' });
    }

    const result = await processAnswerAndGetNextQuestion(
      pitch,
      answeredQuestion,
      userAnswerText,
      currentStatuses || {},
      currentScores || {},
      activeOffers || []
    );
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error processing answer:', err);
    res.status(500).json({ error: 'Failed to process answer', details: message });
  }
});

// Post-pitch debrief & Pitch Doctor scorecard
apiRouter.post('/debrief', async (req: Request, res: Response) => {
  try {
    const { pitch, history, outcome } = req.body;
    if (!pitch) {
      return res.status(400).json({ error: 'pitch is required' });
    }

    const result = await generateDebriefWithGemini(
      pitch,
      history || [],
      outcome || { dealClosed: false }
    );
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error generating debrief:', err);
    res.status(500).json({ error: 'Failed to generate debrief', details: message });
  }
});

// Voice Audio Transcription fallback route via Gemini
apiRouter.post('/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'audioData base64 string is required' });
    }

    const transcript = await transcribeAudioWithGemini(audioData, mimeType || 'audio/webm');
    res.json({ transcript });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Transcription error';
    console.error('Error during voice transcription:', err);
    res.status(500).json({ error: 'Failed to transcribe audio', details: message });
  }
});

