'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getTranscriptByUserId, saveTranscript } = require('../db/queries/transcripts');
const { validateTranscriptData } = require('../utils/validation');

// All routes require authentication
router.use(authenticate);

/**
 * Get user's transcript
 * GET /api/transcripts
 */
router.get('/', async (req, res, next) => {
  try {
    const transcript = await getTranscriptByUserId(req.user.userId);
    
    if (!transcript) {
      return res.json({
        success: true,
        data: null
      });
    }
    
    res.json({
      success: true,
      data: transcript
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Save or update transcript
 * POST /api/transcripts
 */
router.post('/', async (req, res, next) => {
  try {
    const transcriptData = req.body;
    
    if (!transcriptData) {
      return res.status(400).json({ error: 'Transcript data is required' });
    }
    
    // Validate transcript data structure
    const validation = validateTranscriptData(transcriptData);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const savedTranscript = await saveTranscript(req.user.userId, transcriptData);
    
    res.status(201).json({
      success: true,
      data: savedTranscript
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update transcript
 * PUT /api/transcripts
 */
router.put('/', async (req, res, next) => {
  try {
    const transcriptData = req.body;
    
    if (!transcriptData) {
      return res.status(400).json({ error: 'Transcript data is required' });
    }
    
    // Validate transcript data structure
    const validation = validateTranscriptData(transcriptData);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const savedTranscript = await saveTranscript(req.user.userId, transcriptData);
    
    res.json({
      success: true,
      data: savedTranscript
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

