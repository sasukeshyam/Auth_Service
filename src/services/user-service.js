const UserRepository = require('../repository/user-repository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { JWT_KEY } = require('../config/serverConfig');
const { error } = require('console');

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async create(data) {
        try {
            const user = await this.userRepository.create(data)

            const verificationToken = await this.generateVerificationToken(user.id);

            console.log(
            `Verification URL: http://localhost:3001/api/v1/verify-email?token=${verificationToken}`
            );

            return user;
            
        } catch (error) {
            console.log('Something went wronge on Service layer');
            throw error;
        }
    }

    async signIn(email, planePassword) {
        try {
            // step1 - fetch the user using his email
            const user = await this.userRepository.getByEmail(email);

            // step2 - checking user exest or not
            if (!user) {
                throw new Error('User not found');
            }
            // step3 - checking that the user is varified or not
            if (!user.isVerified) {
                throw new Error('Please verify your email before signing in');
            }
            // step4 - compare the incoming password with the stored encrypted password
            const passwordsMatch = this.checkPassword(planePassword, user.password);

            if(!passwordsMatch) {
                console.log("Password doesn't match");
                throw {error: "Incorrect Password"};
            }

            // step5 - if password match then create a token and send it to the user
            const newJWT = this.createToken({email: user.email, id: user.id});
            return newJWT;

        } catch (error) {
            console.log('Something went wronge on Service layer');
            throw error;
        }
    }

    async isAuthenticated(token) {
        try {
            const response = this.verifyToken(token);
            if(!response) {
                throw {error: 'Invalid Token'}
            }

            const user = await this.userRepository.getById(response.id);
            if(!user) {
                throw {error: 'No user with the corresponding token exists'}
            }
            return user.id;
        } catch (error) {
            console.log('Something went wronge on auth process');
            throw error;
        }
    }

    async destroy(userId) {
        try {
            const response = await this.userRepository.destroy({
                where: {
                    id: userId
                }
            })
            return response;
        } catch (error) {
            console.log('Something went wronge on Service layer');
            throw error;
        }
    }

    async generateVerificationToken(userId) {
        try {
            const token = crypto.randomBytes(32).toString('hex');

            const expiresAt = new Date(
                Date.now() + 60 * 60 * 1000
            );

            await this.userRepository.updateVerificationToken(
                userId,
                token,
                expiresAt
            )

            return token;

        } catch (error) {
            console.log('Something went wrong while generating verification token');
            throw error;
        }
    }

    async verifyEmail(token) {
        try {
            const user = await this.userRepository.getByVerificationToken(token);

            if(!user) {
                throw new error('Invalid verification token');
            }

            if(user.verificationTokenExpiresAt < new Date()) {
                throw new error('Verification token expired')
            }

            await this.userRepository.verifyUser(user.id)

            return true;

        } catch (error) {
            console.log('Something went wrong while verifying email');
            throw error;
        }  
    };

    createToken(user) {
        try {
            const result = jwt.sign(user, JWT_KEY, {expiresIn: '1h'});
            return result; 
        } catch (error) {
            console.log('Something went wronge on token creation');
            throw error;
        }
    }

    verifyToken(token) {
        try {
            const response = jwt.verify(token, JWT_KEY);
            return response;
        } catch (error) {
            console.log('Something went wronge on verifing token', error);
            throw error;
        }
    }

    checkPassword(userInputPlainPassword, encryptedPassword) {
        try {
            return bcrypt.compareSync(userInputPlainPassword, encryptedPassword);
        } catch (error) {
            console.log('Something went wronge on password comparison');
            throw error;
        }
    }
}

module.exports = UserService;