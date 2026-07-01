class ApiAirportController {
    constructor(airportRepo) {
        this.airportRepo = airportRepo;
    }

    async getPaginated(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || '';

            const data = await this.airportRepo.findPaginated(page, limit, search);

            res.json({
                success: true,
                data: {
                    count: data.count,
                    rows: data.rows
                }
            });
        } catch (error) {
            console.error('Error fetching airports:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id;
            await this.airportRepo.delete(id);
            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting airport:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async bulkDelete(req, res) {
        try {
            const { ids } = req.body;
            if (!ids || !ids.length) {
                return res.status(400).json({ success: false, message: 'No IDs provided' });
            }
            await this.airportRepo.bulkDelete(ids);
            res.json({ success: true });
        } catch (error) {
            console.error('Error bulk deleting airports:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async searchPublic(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const page = parseInt(req.query.page) || 1;
            const search = req.query.search || '';
            const lat = req.query.lat;
            const lng = req.query.lng;
            const country = req.query.country || null;
            const continent = req.query.continent || null;

            const airports = await this.airportRepo.searchPublicAirports(lat, lng, search, limit, page, country, continent);

            res.json({
                success: true,
                data: airports
            });
        } catch (error) {
            console.error('Error in searchPublic airports:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = ApiAirportController;
