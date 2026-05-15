const BaseRepository = require('./BaseRepository');
const { Op } = require('sequelize');

class ContinentRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }
}

module.exports = ContinentRepository;
