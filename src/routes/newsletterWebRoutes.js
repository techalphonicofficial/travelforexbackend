const express = require('express');
const { Op } = require('sequelize');
const {
  models: { Newsletter }
} = require('../container');

const router = express.Router();

const cleanString = (value, maxLength) => {
  const text = String(value || '').trim();
  return text ? text.slice(0, maxLength) : '';
};

router.get('/', async (req, res) => {
  try {
    const search = cleanString(req.query.search, 180);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where.email = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Newsletter.findAndCountAll({
      attributes: ['id', 'email', 'status', 'subscribed_at', 'created_at'],
      where,
      order: [['subscribed_at', 'DESC'], ['created_at', 'DESC']],
      limit,
      offset
    });

    res.render('newsletters/index', {
      title: 'Newsletter Subscribers',
      subscribers: rows.map(row => row.get ? row.get({ plain: true }) : row),
      search,
      page,
      limit,
      totalCount: count,
      totalPages: Math.max(Math.ceil(count / limit), 1)
    });
  } catch (error) {
    res.status(500).render('newsletters/index', {
      title: 'Newsletter Subscribers',
      subscribers: [],
      search: cleanString(req.query.search, 180),
      page: 1,
      limit: 20,
      totalCount: 0,
      totalPages: 1,
      error: error.message
    });
  }
});

module.exports = router;
