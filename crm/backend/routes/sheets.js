const express = require('express');
const Sheet = require('../models/Sheet');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All sheet routes require authentication
router.use(protect);

// GET /api/sheets — list all sheets for logged-in user
router.get('/', async (req, res, next) => {
  try {
    const sheets = await Sheet.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Append lead counts
    const sheetsWithCounts = await Promise.all(
      sheets.map(async (sheet) => {
        const count = await Lead.countDocuments({ sheetId: sheet._id });
        return { ...sheet.toObject(), leadCount: count };
      })
    );

    res.json({ sheets: sheetsWithCounts });
  } catch (err) {
    next(err);
  }
});

// POST /api/sheets — create a new sheet
router.post('/', async (req, res, next) => {
  try {
    const { sheetName } = req.body;

    if (!sheetName?.trim()) {
      return res.status(400).json({ error: 'Sheet name is required.' });
    }

    const sheet = await Sheet.create({ userId: req.user._id, sheetName: sheetName.trim() });
    res.status(201).json({ sheet: { ...sheet.toObject(), leadCount: 0 } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/sheets/:sheetId — delete a sheet and all its leads
router.delete('/:sheetId', async (req, res, next) => {
  try {
    const sheet = await Sheet.findOne({ _id: req.params.sheetId, userId: req.user._id });

    if (!sheet) {
      return res.status(404).json({ error: 'Sheet not found.' });
    }

    await Lead.deleteMany({ sheetId: sheet._id });
    await sheet.deleteOne();

    res.json({ message: 'Sheet and all associated leads deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/sheets/:sheetId/leads — fetch leads with pagination, search, sort, filter
router.get('/:sheetId/leads', async (req, res, next) => {
  try {
    const sheet = await Sheet.findOne({ _id: req.params.sheetId, userId: req.user._id });
    if (!sheet) return res.status(404).json({ error: 'Sheet not found.' });

    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { sheetId: sheet._id };

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { company: regex }];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    // Build sort
    const sortObj = {};
    const allowedSortFields = ['createdAt', 'name', 'company', 'status'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';
    sortObj[sortField] = order === 'asc' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(query).sort(sortObj).skip(skip).limit(limitNum),
      Lead.countDocuments(query),
    ]);

    res.json({
      leads,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/sheets/:sheetId/leads — create a lead in this sheet
router.post('/:sheetId/leads', async (req, res, next) => {
  try {
    const sheet = await Sheet.findOne({ _id: req.params.sheetId, userId: req.user._id });
    if (!sheet) return res.status(404).json({ error: 'Sheet not found.' });

    const { name, email, phone, company, status = 'New', notes = '' } = req.body;

    const lead = await Lead.create({
      sheetId: sheet._id,
      name,
      email,
      phone,
      company,
      status,
      notes,
    });

    res.status(201).json({ lead });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    next(err);
  }
});

// GET /api/sheets/:sheetId/stats — analytics aggregation
router.get('/:sheetId/stats', async (req, res, next) => {
  try {
    const sheet = await Sheet.findOne({ _id: req.params.sheetId, userId: req.user._id });
    if (!sheet) return res.status(404).json({ error: 'Sheet not found.' });

    const [statusBreakdown, totalResult] = await Promise.all([
      Lead.aggregate([
        { $match: { sheetId: sheet._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Lead.aggregate([
        { $match: { sheetId: sheet._id } },
        { $count: 'total' },
      ]),
    ]);

    const total = totalResult[0]?.total || 0;
    const statusMap = {};
    statusBreakdown.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    const converted = statusMap['Converted'] || 0;
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0';

    // Active = not Lost or Converted
    const active = (statusMap['New'] || 0) + (statusMap['Contacted'] || 0) + (statusMap['Qualified'] || 0);

    res.json({
      stats: {
        total,
        active,
        converted,
        lost: statusMap['Lost'] || 0,
        conversionRate: parseFloat(conversionRate),
        statusBreakdown: statusBreakdown.map((s) => ({ status: s._id, count: s.count })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/sheets/:sheetId/export — CSV export
router.get('/:sheetId/export', async (req, res, next) => {
  try {
    const sheet = await Sheet.findOne({ _id: req.params.sheetId, userId: req.user._id });
    if (!sheet) return res.status(404).json({ error: 'Sheet not found.' });

    const leads = await Lead.find({ sheetId: sheet._id }).sort({ createdAt: -1 });

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Notes', 'Created At'];
    const rows = leads.map((l) => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      `"${l.createdAt.toISOString()}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const filename = `${sheet.sheetName.replace(/[^a-z0-9]/gi, '_')}_leads.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

// POST /api/sheets/:sheetId/import — CSV bulk import
router.post('/:sheetId/import', async (req, res, next) => {
  try {
    const sheet = await Sheet.findOne({ _id: req.params.sheetId, userId: req.user._id });
    if (!sheet) return res.status(404).json({ error: 'Sheet not found.' });

    const { rows } = req.body; // Expect pre-parsed array from frontend
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No valid rows provided.' });
    }

    const VALID_STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
    const leadsToInsert = rows.map((row) => ({
      sheetId: sheet._id,
      name: row.name || row.Name || '',
      email: row.email || row.Email || '',
      phone: row.phone || row.Phone || '',
      company: row.company || row.Company || '',
      status: VALID_STATUSES.includes(row.status || row.Status) ? (row.status || row.Status) : 'New',
      notes: row.notes || row.Notes || '',
    })).filter((l) => l.name && l.email);

    if (leadsToInsert.length === 0) {
      return res.status(400).json({ error: 'No valid leads found. Ensure rows have Name and Email.' });
    }

    const inserted = await Lead.insertMany(leadsToInsert, { ordered: false });
    res.status(201).json({ message: `${inserted.length} leads imported successfully.`, count: inserted.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/sheets/:sheetId/kanban — all leads for kanban (no pagination)
router.get('/:sheetId/kanban', async (req, res, next) => {
  try {
    const sheet = await Sheet.findOne({ _id: req.params.sheetId, userId: req.user._id });
    if (!sheet) return res.status(404).json({ error: 'Sheet not found.' });

    const leads = await Lead.find({ sheetId: sheet._id }).sort({ createdAt: -1 });
    res.json({ leads });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
