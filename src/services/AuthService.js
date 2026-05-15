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

    console.log('STEP 1 - email:', email);

    let user;

    try {

      user = await this.userRepo.findByEmail(email);

      console.log('User found:', user);

    } catch (error) {

      console.log('DB Error:', error);

      throw new Error('Database error while finding user');
    }

    console.log('STEP 2 - user:', user);

    if (!user) {
      console.log('STEP 3 - User not found');
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log('STEP 4 - password match:', isMatch);

    if (!isMatch) {
      console.log('STEP 5 - Invalid credentials');
      throw new Error('Invalid credentials');
    }

    console.log('STEP 6 - user status:', user.status);

    if (!user.status) {
      console.log('STEP 7 - Account deactivated');
      throw new Error('Account is deactivated');
    }

    console.log('STEP 8 - user type:', user.type);
    console.log('STEP 9 - role_id:', user.role_id);

    // Role permissions only for admins
    if (user.type === 'admin' && user.role_id) {

      console.log('STEP 10 - fetching permissions');

      const permissions = await this.roleRepo.getRolePermissions(user.role_id);

      console.log('STEP 11 - permissions:', permissions);

      user.permissions = permissions.map(p => p.name);

      console.log('STEP 12 - mapped permissions:', user.permissions);

    } else {

      console.log('STEP 13 - no permissions');

      user.permissions = [];
    }

    console.log('STEP 14 - final user:', user);

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
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type
    };
    return jwt.sign(payload, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '24h' });
  }
}

module.exports = AuthService;
