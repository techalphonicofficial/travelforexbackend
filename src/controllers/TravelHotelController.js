class TravelHotelController {
    constructor(Hotel, Destination) {
        this.Hotel = Hotel;
        this.Destination = Destination;
    }

    mediaModel() {
        return this.Hotel.sequelize.models.Media;
    }

    asArray(value) {
        if (value === undefined || value === null || value === '') return [];
        return Array.isArray(value) ? value : [value];
    }

    parseGalleryUrls(value) {
        if (!value) return [];
        return String(value)
            .split(/\r?\n|,/)
            .map(item => item.trim())
            .filter(Boolean);
    }

    parseAmenities(body) {
        const raw = body.amenities || body['amenities[]'] || [];
        const values = Array.isArray(raw) ? raw : String(raw).split(',');
        return [...new Set(values.map(item => String(item).trim()).filter(Boolean))];
    }

    parseHotelPayload(body) {
        const rating = parseInt(body.star_rating, 10);
        const totalRooms = parseInt(body.total_rooms, 10);
        const guestRating = parseFloat(body.guest_rating);
        const discountPercent = parseFloat(body.discount_percent);
        const commissionPercent = parseFloat(body.commission_percent);

        return {
            name: body.name,
            destination_id: body.destination_id,
            star_rating: Number.isInteger(rating) ? Math.min(Math.max(rating, 1), 5) : 3,
            price_per_night: body.price_per_night || 0,
            total_rooms: Number.isInteger(totalRooms) && totalRooms >= 0 ? totalRooms : 0,
            guest_rating: Number.isFinite(guestRating) ? Math.min(Math.max(guestRating, 0), 5).toFixed(1) : 0,
            amenities: this.parseAmenities(body),
            discount_percent: Number.isFinite(discountPercent) ? Math.min(Math.max(discountPercent, 0), 100).toFixed(2) : 0,
            commission_percent: Number.isFinite(commissionPercent) ? Math.min(Math.max(commissionPercent, 0), 100).toFixed(2) : 0,
            description: body.description,
            source_type: body.source_type || 'manual',
            provider_name: body.provider_name
        };
    }

    getLocationModels() {
        const models = this.Hotel.sequelize.models || {};
        return {
            DestinationMapping: models.DestinationMapping,
            City: models.City,
            Country: models.Country
        };
    }

    normalizeFilter(value) {
        return String(value || '').trim();
    }

    parsePagination(query) {
        const limitOptions = [10, 25, 50, 100];
        const requestedLimit = parseInt(query.limit, 10);
        const requestedPage = parseInt(query.page, 10);

        return {
            limitOptions,
            limit: limitOptions.includes(requestedLimit) ? requestedLimit : 10,
            page: Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
        };
    }

    async getDestinationLocationMap(destinationIds = []) {
        const { DestinationMapping, City, Country } = this.getLocationModels();
        if (!DestinationMapping || !City || !Country || !destinationIds.length) return {};

        const Op = this.Hotel.sequelize.Sequelize.Op;
        const mappings = await DestinationMapping.findAll({
            where: { destination_id: { [Op.in]: destinationIds } },
            include: [
                {
                    model: City,
                    as: 'city',
                    include: [{ model: Country, as: 'country' }]
                }
            ],
            order: [['id', 'ASC']]
        });

        const locationMap = {};
        mappings.forEach(mapping => {
            const plain = mapping.get({ plain: true });
            if (locationMap[plain.destination_id]) return;

            locationMap[plain.destination_id] = {
                city: plain.city ? plain.city.name : '',
                country: plain.city && plain.city.country ? plain.city.country.name : ''
            };
        });

        return locationMap;
    }

    buildLocationOptions(destinations, locationMap) {
        const countries = new Set();
        const cities = new Set();

        destinations.forEach(destination => {
            const plain = destination.get ? destination.get({ plain: true }) : destination;
            const location = locationMap[plain.id] || {};
            const country = location.country || plain.country;
            const city = location.city || plain.name;

            if (country) countries.add(country);
            if (city) cities.add(city);
        });

        return {
            countryOptions: [...countries].sort((a, b) => a.localeCompare(b)),
            cityOptions: [...cities].sort((a, b) => a.localeCompare(b))
        };
    }

    async getHotelCityOptions(selectedDestinationId = null) {
        const destinations = await this.Destination.findAll({ order: [['name', 'ASC']] });
        const { DestinationMapping, City } = this.getLocationModels();

        if (!DestinationMapping || !City) {
            return destinations.map(destination => ({
                id: destination.id,
                name: destination.name
            }));
        }

        const mappings = await DestinationMapping.findAll({
            include: [{ model: City, as: 'city', required: true }],
            order: [['id', 'ASC']]
        });
        const destinationIds = new Set(destinations.map(destination => destination.id));
        const optionsByCity = new Map();

        mappings.forEach(mapping => {
            const plain = mapping.get({ plain: true });
            if (!destinationIds.has(plain.destination_id) || !plain.city) return;

            const existing = optionsByCity.get(plain.city_id);
            const shouldUseCurrentDestination = Number(plain.destination_id) === Number(selectedDestinationId);
            if (!existing || shouldUseCurrentDestination) {
                optionsByCity.set(plain.city_id, {
                    id: plain.destination_id,
                    name: plain.city.name
                });
            }
        });

        return [...optionsByCity.values()]
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    destinationMatchesLocation(destination, location, filters) {
        const country = this.normalizeFilter(location.country || destination.country).toLowerCase();
        const city = this.normalizeFilter(location.city || destination.name).toLowerCase();
        const destinationName = this.normalizeFilter(destination.name).toLowerCase();

        if (filters.country && country !== filters.country.toLowerCase()) return false;
        if (filters.city && city !== filters.city.toLowerCase() && destinationName !== filters.city.toLowerCase()) return false;
        return true;
    }

    buildHotelWhere(filters, destinations, locationMap) {
        const Op = this.Hotel.sequelize.Sequelize.Op;
        const where = {};

        const locationFiltered = Boolean(filters.country || filters.city);
        let matchingDestinationIds = destinations
            .filter(destination => this.destinationMatchesLocation(
                destination.get({ plain: true }),
                locationMap[destination.id] || {},
                filters
            ))
            .map(destination => destination.id);

        if (locationFiltered) {
            where.destination_id = { [Op.in]: matchingDestinationIds };
        }

        if (filters.search) {
            const search = `%${filters.search}%`;
            const searchDestinationIds = destinations
                .filter(destination => {
                    const plain = destination.get({ plain: true });
                    const location = locationMap[plain.id] || {};
                    const values = [
                        plain.name,
                        plain.country,
                        location.city,
                        location.country
                    ].filter(Boolean).map(value => String(value).toLowerCase());

                    return values.some(value => value.includes(filters.search.toLowerCase()));
                })
                .map(destination => destination.id);

            where[this.Hotel.sequelize.Sequelize.Op.or] = [
                { name: { [Op.iLike]: search } },
                { provider_name: { [Op.iLike]: search } },
                { destination_id: { [Op.in]: searchDestinationIds } }
            ];
        }

        return where;
    }

    uploadedGalleryUrls(req) {
        const files = req.files && req.files.gallery_files ? req.files.gallery_files : [];
        return files.map(file => `/uploads/hotels/${file.filename}`);
    }

    async fetchHotelGallery(hotelId) {
        const Media = this.mediaModel();
        if (!Media) return [];

        return Media.findAll({
            where: {
                entity_type: 'hotel',
                entity_id: hotelId
            },
            order: [
                ['is_primary', 'DESC'],
                ['id', 'ASC']
            ]
        });
    }

    async attachGalleryToHotels(hotels) {
        const Media = this.mediaModel();
        if (!Media || !hotels.length) {
            return hotels.map(hotel => hotel.get({ plain: true }));
        }

        const Op = this.Hotel.sequelize.Sequelize.Op;
        const hotelIds = hotels.map(hotel => hotel.id);
        const mediaRows = await Media.findAll({
            where: {
                entity_type: 'hotel',
                entity_id: { [Op.in]: hotelIds }
            },
            order: [
                ['is_primary', 'DESC'],
                ['id', 'ASC']
            ]
        });

        const galleryByHotel = {};
        mediaRows.forEach(media => {
            const row = media.get({ plain: true });
            if (!galleryByHotel[row.entity_id]) galleryByHotel[row.entity_id] = [];
            galleryByHotel[row.entity_id].push(row);
        });

        return hotels.map(hotel => {
            const plain = hotel.get({ plain: true });
            plain.gallery = galleryByHotel[plain.id] || [];
            return plain;
        });
    }

    async syncPrimaryImage(hotel, preferredMediaId = null) {
        const Media = this.mediaModel();
        if (!Media) return;

        const gallery = await this.fetchHotelGallery(hotel.id);
        if (!gallery.length) {
            await hotel.update({ image_url: null });
            return;
        }

        let primary = null;
        const numericPreferredId = parseInt(preferredMediaId, 10);
        if (Number.isInteger(numericPreferredId) && numericPreferredId > 0) {
            primary = gallery.find(item => item.id === numericPreferredId) || null;
        }

        primary = primary || gallery.find(item => item.is_primary) || gallery[0];

        await Media.update(
            { is_primary: false },
            { where: { entity_type: 'hotel', entity_id: hotel.id } }
        );
        await primary.update({ is_primary: true });
        await hotel.update({ image_url: primary.url });
    }

    async saveGallery(hotel, req) {
        const Media = this.mediaModel();
        if (!Media) return;

        const removeIds = this.asArray(req.body.remove_media_ids)
            .map(id => parseInt(id, 10))
            .filter(id => Number.isInteger(id) && id > 0);

        if (removeIds.length) {
            const Op = this.Hotel.sequelize.Sequelize.Op;
            await Media.destroy({
                where: {
                    id: { [Op.in]: removeIds },
                    entity_type: 'hotel',
                    entity_id: hotel.id
                }
            });
        }

        const galleryUrls = [
            ...this.parseGalleryUrls(req.body.gallery_urls),
            ...this.uploadedGalleryUrls(req)
        ];

        if (galleryUrls.length) {
            const existingCount = await Media.count({
                where: {
                    entity_type: 'hotel',
                    entity_id: hotel.id
                }
            });

            await Media.bulkCreate(galleryUrls.map((url, index) => ({
                entity_type: 'hotel',
                entity_id: hotel.id,
                url,
                media_type: /\.(mp4|mov|avi|webm)$/i.test(url) ? 'video' : 'image',
                alt_text: hotel.name,
                is_primary: existingCount === 0 && index === 0
            })));
        }

        await this.syncPrimaryImage(hotel, req.body.primary_media_id);
    }

    async index(req, res) {
        try {
            const filters = {
                search: this.normalizeFilter(req.query.search),
                country: this.normalizeFilter(req.query.country),
                city: this.normalizeFilter(req.query.city)
            };
            const paginationRequest = this.parsePagination(req.query);

            const destinations = await this.Destination.findAll({ order: [['name', 'ASC']] });
            const destinationIds = destinations.map(destination => destination.id);
            const locationMap = await this.getDestinationLocationMap(destinationIds);
            const where = this.buildHotelWhere(filters, destinations, locationMap);
            const totalHotels = await this.Hotel.count({ where });
            const totalPages = Math.max(1, Math.ceil(totalHotels / paginationRequest.limit));
            const currentPage = Math.min(paginationRequest.page, totalPages);
            const offset = (currentPage - 1) * paginationRequest.limit;
            const hotels = await this.Hotel.findAll({
                where,
                order: [['created_at', 'DESC']],
                limit: paginationRequest.limit,
                offset
            });
            const locationOptions = this.buildLocationOptions(destinations, locationMap);
            const startItem = totalHotels ? offset + 1 : 0;
            const endItem = Math.min(offset + hotels.length, totalHotels);

            const destMap = {};
            destinations.forEach(d => { destMap[d.id] = d; });
            const hotelsWithGallery = await this.attachGalleryToHotels(hotels);
            const hotelsWithDest = hotelsWithGallery.map(plain => {
                const destination = destMap[plain.destination_id] ? destMap[plain.destination_id].get({ plain: true }) : null;
                const location = locationMap[plain.destination_id] || {};
                plain.destination = destination;
                plain.location = {
                    city: location.city || (destination ? destination.name : ''),
                    country: location.country || (destination ? destination.country : '')
                };
                return plain;
            });

            res.render('travel/hotels/index', {
                title: 'Hotels',
                hotels: hotelsWithDest,
                filters,
                countryOptions: locationOptions.countryOptions,
                cityOptions: locationOptions.cityOptions,
                pagination: {
                    currentPage,
                    totalPages,
                    totalHotels,
                    limit: paginationRequest.limit,
                    limitOptions: paginationRequest.limitOptions,
                    startItem,
                    endItem
                },
                user: req.session.user,
                hotelSourceMode: req._hotelSourceMode || 'manual',
                hotelApiKey: req._hotelApiKey || '',
                hotelApiProvider: req._hotelApiProvider || '',
                blocked: req.query.blocked === '1'
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    async create(req, res) {
        try {
            const cityOptions = await this.getHotelCityOptions();
            res.render('travel/hotels/form', { title: 'Add Hotel', hotel: null, gallery: [], cityOptions, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    async store(req, res) {
        try {
            const hotel = await this.Hotel.create({
                ...this.parseHotelPayload(req.body),
                image_url: null,
            });
            await this.saveGallery(hotel, req);
            res.redirect('/travel/hotels');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    async edit(req, res) {
        try {
            const hotel = await this.Hotel.findByPk(req.params.id);
            if (!hotel) return res.status(404).send('Not Found');
            const cityOptions = await this.getHotelCityOptions(hotel.destination_id);
            const gallery = await this.fetchHotelGallery(hotel.id);
            res.render('travel/hotels/form', {
                title: 'Edit Hotel',
                hotel: hotel.get({ plain: true }),
                gallery: gallery.map(item => item.get({ plain: true })),
                cityOptions,
                user: req.session.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    async update(req, res) {
        try {
            const hotel = await this.Hotel.findByPk(req.params.id);
            if (!hotel) return res.status(404).send('Not Found');
            await hotel.update(this.parseHotelPayload(req.body));
            await this.saveGallery(hotel, req);
            res.redirect('/travel/hotels');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    async destroy(req, res) {
        try {
            const hotel = await this.Hotel.findByPk(req.params.id);
            if (!hotel) return res.status(404).json({ success: false });
            const Media = this.mediaModel();
            if (Media) {
                await Media.destroy({ where: { entity_type: 'hotel', entity_id: hotel.id } });
            }
            await hotel.destroy();
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false });
        }
    }

    async bulkDestroy(req, res) {
        const ids = this.asArray(req.body.ids)
            .map(id => parseInt(id, 10))
            .filter(id => Number.isInteger(id) && id > 0);
        const uniqueIds = [...new Set(ids)];

        if (!uniqueIds.length) {
            return res.status(400).json({ success: false, message: 'Select at least one hotel.' });
        }

        const transaction = await this.Hotel.sequelize.transaction();
        try {
            const Op = this.Hotel.sequelize.Sequelize.Op;
            const Media = this.mediaModel();

            if (Media) {
                await Media.destroy({
                    where: {
                        entity_type: 'hotel',
                        entity_id: { [Op.in]: uniqueIds }
                    },
                    transaction
                });
            }

            const deleted = await this.Hotel.destroy({
                where: { id: { [Op.in]: uniqueIds } },
                transaction
            });

            await transaction.commit();
            return res.json({ success: true, deleted });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return res.status(500).json({ success: false, message: 'Unable to delete selected hotels.' });
        }
    }
}

module.exports = TravelHotelController;
