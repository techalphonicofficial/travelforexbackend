const fs = require('fs');
let code = fs.readFileSync('src/repositories/PackageRepository.js', 'utf8');

const brokenStr = `                order: [
                    ['is_primary', 'DESC'],
                    ['id', 'ASC']
    }`;

const fixedStr = `                order: [
                    ['is_primary', 'DESC'],
                    ['id', 'ASC']
                ]
            }],
            order: [['created_at', 'DESC']]
        }];
    }

    async findAll() {
        return this.model.findAll({
            include: [
                { 
                    model: this.packageDestinationModel, as: 'destinations',
                    include: [{ model: this.destinationModel, as: 'destination' }]
                },
                { model: this.mediaModel, as: 'gallery' }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async findAllPaginated({ page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        return this.model.findAndCountAll({
            include: [
                { 
                    model: this.packageDestinationModel, as: 'destinations', attributes: { exclude: ['activities'] }, include: [{ model: this.destinationModel, as: 'destination' }]
                },
                { model: this.mediaModel, as: 'gallery' },
                { association: 'package_categories' }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });
    }`;

code = code.replace(brokenStr, fixedStr);
fs.writeFileSync('src/repositories/PackageRepository.js', code);
console.log("Done");
