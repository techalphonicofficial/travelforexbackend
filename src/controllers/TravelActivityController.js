class TravelActivityController {
    constructor(Activity, Destination) {
        this.Activity = Activity;
        this.Destination = Destination;
    }

    async index(req, res) {
        try {
            // Fetch separately to avoid Sequelize scope injection issues
            const activities = await this.Activity.findAll({ order: [['created_at', 'DESC']] });
            const destinations = await this.Destination.findAll();
            const destMap = {};
            destinations.forEach(d => { destMap[d.id] = d; });
            const activitiesWithDest = activities.map(a => {
                const plain = a.get({ plain: true });
                plain.destination = destMap[plain.destination_id] || null;
                return plain;
            });
            res.render('travel/activities/index', { title: 'Activities', activities: activitiesWithDest, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    async create(req, res) {
        try {
            const destinations = await this.Destination.findAll({ order: [['name', 'ASC']] });
            res.render('travel/activities/form', { title: 'Add Activity', activity: null, destinations, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    async store(req, res) {
        try {
            const { name, destination_id, price, duration_minutes, description, source_type, provider_name } = req.body;
            await this.Activity.create({ name, destination_id, price, duration_minutes, description, source_type: source_type || 'manual', provider_name });
            res.redirect('/travel/activities');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    async edit(req, res) {
        try {
            const activity = await this.Activity.findByPk(req.params.id);
            const destinations = await this.Destination.findAll({ order: [['name', 'ASC']] });
            if (!activity) return res.status(404).send('Not Found');
            res.render('travel/activities/form', { title: 'Edit Activity', activity, destinations, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    async update(req, res) {
        try {
            const activity = await this.Activity.findByPk(req.params.id);
            if (!activity) return res.status(404).send('Not Found');
            const { name, destination_id, price, duration_minutes, description, source_type, provider_name } = req.body;
            await activity.update({ name, destination_id, price, duration_minutes, description, source_type: source_type || 'manual', provider_name });
            res.redirect('/travel/activities');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    async destroy(req, res) {
        try {
            const activity = await this.Activity.findByPk(req.params.id);
            if (!activity) return res.status(404).json({ success: false });
            await activity.destroy();
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false });
        }
    }
}

module.exports = TravelActivityController;
