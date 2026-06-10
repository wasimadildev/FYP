const Conversation = require('../models/Conversation');
const HealthRecord = require('../models/HealthRecord');
const Vitals = require('../models/Vitals');
const aiService = require('../services/ai.service');
const specialistService = require('../services/specialist.service');

async function chat(req, res, next) {
  try {
    const { message, conversationId } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }
    } else {
      conversation = await Conversation.create({
        patientId: req.body.patientId || req.user.id,
        doctorId: req.user.role === 'doctor' ? req.user.id : undefined,
        title: message.slice(0, 100),
      });
    }

    conversation.messages.push({ role: 'user', content: message });

    const reply = await aiService.chat(conversation.messages);

    conversation.messages.push({ role: 'assistant', content: reply });
    await conversation.save();

    res.json({ success: true, data: { reply, conversationId: conversation._id } });
  } catch (err) {
    next(err);
  }
}

async function summarizeRecords(req, res, next) {
  try {
    const { patientId } = req.body;
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required' });
    }

    const records = await HealthRecord.find({ patientId, isActive: true })
      .select('fileType category description createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    if (records.length === 0) {
      return res.json({ success: true, data: { summary: 'No records found for this patient.' } });
    }

    const text = records
      .map((r) => `[${r.fileType}] ${r.category || 'N/A'}: ${r.description || 'No description'} (${r.createdAt.toISOString().split('T')[0]})`)
      .join('\n');

    const summary = await aiService.summarize(text);
    res.json({ success: true, data: { summary, recordCount: records.length } });
  } catch (err) {
    next(err);
  }
}

async function findSpecialist(req, res, next) {
  try {
    const { symptoms } = req.body;
    if (!symptoms) {
      return res.status(400).json({ success: false, message: 'Symptoms are required' });
    }

    const specialties = specialistService.mapSymptomToSpecialty(symptoms);
    res.json({ success: true, data: { specialties } });
  } catch (err) {
    next(err);
  }
}

async function analyzeVitals(req, res, next) {
  try {
    const { patientId, vitalsId } = req.body;
    let vitalsData;

    if (vitalsId) {
      vitalsData = await Vitals.findById(vitalsId);
      if (!vitalsData) {
        return res.status(404).json({ success: false, message: 'Vitals record not found' });
      }
    } else if (patientId) {
      vitalsData = await Vitals.findOne({ patientId }).sort({ recordedAt: -1 });
      if (!vitalsData) {
        return res.status(404).json({ success: false, message: 'No vitals found for patient' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'patientId or vitalsId is required' });
    }

    const analysis = await aiService.analyzeVitals(vitalsData.toObject());
    res.json({ success: true, data: { analysis, vitals: vitalsData } });
  } catch (err) {
    next(err);
  }
}

module.exports = { chat, summarizeRecords, findSpecialist, analyzeVitals };
