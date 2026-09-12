const UserRepository = require('../repository/user-repository');

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async create(data) {
        try {
            const user = await this.userRepository.create(data)
            return user;
        } catch (error) {
            console.log('Something went wronge on Service layer');
            throw error;
        }
    }

    async destroy(userId) {
        try {
            const response = this.userRepository.destroy({
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
}

module.exports = UserService;