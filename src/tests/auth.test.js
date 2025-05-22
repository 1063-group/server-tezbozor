const request = require('supertest');
const app = require('../server.js');
const User = require('../models/User.js');

// Test uchun ma'lumotlar
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
};

// Testdan oldin va keyin ma'lumotlarni tozalash
beforeAll(async () => {
    await User.deleteMany({});
});

afterAll(async () => {
    await User.deleteMany({});
});

// Ro'yxatdan o'tish testi
describe('POST /api/auth/register', () => {
    it('Yangi foydalanuvchini ro\'yxatdan o\'tkazish', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('username', testUser.username);
        expect(res.body).toHaveProperty('email', testUser.email);
    });

    it('Bir xil email bilan ro\'yxatdan o\'tishga urinish', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Foydalanuvchi allaqachon mavjud');
    });
});

// Tizimga kirish testi
describe('POST /api/auth/login', () => {
    it('Mavjud foydalanuvchi bilan tizimga kirish', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('username', testUser.username);
        expect(res.body).toHaveProperty('email', testUser.email);
    });

    it('Noto\'g\'ri parol bilan tizimga kirishga urinish', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'notcorrectpassword',
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Noto\'g\'ri parol');
    });

    it('Mavjud bo\'lmagan foydalanuvchi bilan tizimga kirishga urinish', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Foydalanuvchi topilmadi');
    });
});