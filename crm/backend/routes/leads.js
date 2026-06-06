const express = require('express');
const Lead = require('../models/Lead');
const Sheet = require('../models/Sheet');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Helper: verify lead belongs to user
const verifyLeadOwnership = async (leadId, userId) => {
  const lead = await Lead.findById(leadId);
  if (!lead) return { error: 'Lead not found.', status: 404 };

  const sheet = await Sheet.findOne({ _id: lead.sheetId, userId });
  if (!sheet) return { error: 'Access denied.', status: 403 };

  return { lead, sheet };
};

// PUT /api/leads/:id — update lead
router.put('/:id', async (req, res, next) => {
  try {
    const { lead, error, status } = await verifyLeadOwnership(req.params.id, req.user._id);
    if (error) return res.status(status).json({ error });

    const { name, email, phone, company, status: newStatus, notes } = req.body;
    const VALID_STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

    // Track status change
    if (newStatus && newStatus !== lead.status) {
      if (!VALID_STATUSES.includes(newStatus)) {
        return res.status(400).json({ error: 'Invalid status value.' });
      }
      lead._previousStatus = lead.status;
      lead.statusHistory.push({
        fromStatus: lead.status,
        toStatus: newStatus,
        changedAt: new Date(),
      });
      lead.status = newStatus;
    }

    if (name !== undefined) lead.name = name;
    if (email !== undefined) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (company !== undefined) lead.company = company;
    if (notes !== undefined) lead.notes = notes;

    await lead.save();
    res.json({ lead });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    next(err);
  }
});

// DELETE /api/leads/:id — delete a lead
router.delete('/:id', async (req, res, next) => {
  try {
    const { lead, error, status } = await verifyLeadOwnership(req.params.id, req.user._id);
    if (error) return res.status(status).json({ error });

    await lead.deleteOne();
    res.json({ message: 'Lead deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
