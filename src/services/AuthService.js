const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthService {
  constructor(userRepo, roleRepo, customerRepo) {
    this.userRepo = userRepo;
    this.roleRepo = roleRepo;
    this.customerRepo = customerRepo;
  }

  async login(email, password) {



    let user;

    try {

      user = await this.userRepo.findByEmail(email);



    } catch (error) {



      throw new Error('Database error while finding user');
    }



    if (!user) {

      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);



    if (!isMatch) {

      throw new Error('Invalid credentials');
    }



    if (!user.status) {

      throw new Error('Account is deactivated');
    }




    user.role_name = user.role ? user.role.name : null;

    // Role permissions only for admins and managers
    if (['admin', 'manager', 'employee'].includes(user.type) && user.role_id) {



      const permissions = await this.roleRepo.getRolePermissions(user.role_id);



      user.permissions = permissions.map(p => p.name);



    } else {



      user.permissions = [];
    }



    return user;
  }
  async register(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.userRepo.create({
      ...userData,
      password: hashedPassword,
      type: userData.type || 'admin'
    });
  }

  async customerRegister(userData, customerData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user first
    const user = await this.userRepo.create({
      name: userData.name,
      email: userData.email,
      phone_number: userData.phone_number,
      password: hashedPassword,
      type: 'customer',
      role_id: null,
      status: true
    });

    // Create customer profile

    return { user };
  }

  async changePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.userRepo.update(id, {
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null
    });
  }

  async requestPasswordReset(email) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error('User not found');

    // Generate random 6-digit token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // 1 hour expiry

    await this.userRepo.update(user.id, {
      reset_password_token: token,
      reset_password_expires: expiry
    });

    return token; // Return token for dev/testing
  }

  async resetPassword(token, newPassword) {
    const user = await this.userRepo.model.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) throw new Error('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null
    });

    return user;
  }

  generateToken(user) {
    const roleName = user.role_name || (user.role ? user.role.name : null);
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      role_id: user.role_id || null,
      role_name: roleName
    };
    return jwt.sign(payload, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '24h' });
  }
}

module.exports = AuthService;
