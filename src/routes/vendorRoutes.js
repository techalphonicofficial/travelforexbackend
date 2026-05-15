const express = require('express');
const router = express.Router();
const container = require('../container');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `public/uploads/packages`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `pack-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|mp4|mov|avi|webm/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images and videos are allowed!'));
    }
});

const { vendorAuthController, vendorDashboardController, vendorPackageController, vendorWalletController } = container.controllers;

// Middleware to check if vendor is logged in
const isVendor = (req, res, next) => {
    if (req.session.user && req.session.user.type === 'vendor') {
        return next();
    }
    res.redirect('/vendor/login');
};

// Auth Routes
router.get('/login', (req, res) => vendorAuthController.loginForm(req, res));
router.post('/login', (req, res) => vendorAuthController.login(req, res));
router.get('/logout', (req, res) => vendorAuthController.logout(req, res));

// Dashboard
router.get('/dashboard', isVendor, (req, res) => vendorDashboardController.index(req, res));

// Packages
router.get('/packages', isVendor, (req, res) => vendorPackageController.index(req, res));
router.get('/packages/create', isVendor, (req, res) => vendorPackageController.create(req, res));
router.post('/packages/save', isVendor, (req, res) => vendorPackageController.save(req, res));
router.get('/packages/:id/edit', isVendor, (req, res) => vendorPackageController.edit(req, res));
router.delete('/packages/:id', isVendor, (req, res) => vendorPackageController.delete(req, res));

// Package Gallery
router.post('/packages/:id/gallery', isVendor, upload.single('media'), (req, res) => vendorPackageController.uploadMedia(req, res));
router.delete('/packages/:id/gallery/:mediaId', isVendor, (req, res) => vendorPackageController.deleteMedia(req, res));

// Wallet
router.get('/wallet', isVendor, (req, res) => vendorWalletController.index(req, res));

module.exports = router;
