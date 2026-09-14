const { where } = require('sequelize');
const { User } = require('../models/index');

class Userrepository {

    async create(data) {
        try {
            const user = await User.create(data);
            return user
        } catch (error) {
            console.log('Something went wronge on repository layer');
            throw error;
        }
    }

    async destroy(userId) {
        try {
            await User.destroy({
                where: {
                    id: userId
                }
            });
            return true
        } catch (error) {
            console.log('Something went wronge on repository layer');
            throw error;
        }
    }

    async getById(userId) {
        try {
            const user = await User.findByPk(userId, {
                attributes: ['email', 'id']
            });
            return user;
        } catch (error) {
            console.log('Something went wronge on repository layer');
            throw error;
        }
    }

    async getByEmail(userEmail) {
        try {
            const user = await User.findOne({where: {
                email: userEmail
            }})
            return user
        } catch (error) {
            console.log('Something went wronge on repository layer');
            throw error;
        }
    }

    async updateVerificationToken(userId, token, expiresAt) {
        try {
            await User.update(
                {
                    verificationToken: token,
                    verificationTokenExpiresAt: expiresAt
                },
                {
                    where: {
                        id: userId
                    }
                }
        )
        return true;

        } catch (error) {
            console.log('Something went wronge on repository layer');
            throw error;
        }
    }

    async getByVerificationToken(token) {
        try {
            const user = await User.findOne({
                where: {
                    verificationToken: token
                }
            });
            return user
        } catch (error) {
            console.log('Something went wronge on repository layer');
            throw error;
        }
    }

    async isVerified(userId) {
        try {
            await User.update(
                {
                    isVerified: true,
                    verificationToken: null,
                    verificationTokenExpiresAt: null
                },
                {where: {
                    id: userId
                }}
            );
            return true;
        } catch (error) {
            console.log('Something went wronge on repository layer');
            throw error;
        }
    }

    async verifyUser(userId) {
    try {
        const response = await User.update(
            {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpiresAt: null
            },
            {
                where: {
                    id: userId
                }
            }
        );

        return response;

    } catch (error) {
        console.log('Something went wrong on repository layer');
        throw error;
    }
}

}

module.exports = Userrepository; 