import {AppDataSource} from "../database/data-source";
import {Users} from "../models/Users";
import bcrypt from "bcrypt";
import {In, Like, Not} from "typeorm";

const userRepository = AppDataSource.getRepository(Users);

class UserService {

    async getDataUser(req) {
        let user = await userRepository.findOne({
            select: {
                id: true,
                email: true,
                avatar: true,
                name: true
            },
            where: {
                id: req.user.id
            }
        });
        if (user) {
            return user
        }
    }

    async checkUser(req) {
        let user = await userRepository.findOne({
            where:
                {email: req.body.email}
        })
        if (user) {
            return user
        }
    };

    async getUserById(req) {
        let user = await userRepository.findOne({
            where:
                {id: req.body.userIds}
        })
        if (user) {
            return user
        }
    }

    async getUsers(req) {
        const {userIds} = req.body
        let users = userRepository.find({
            where: {
                id: In(userIds)
            }
        })
        return users
    }

    async getPassword(req) {
        let user = await userRepository.findOne({
            select: {
                password: true,
            },
            where:
                {id: req.user.id}
        })
        if (user) {
            return user
        }
    }

    async createUser(req) {
        const {name, email, password} = req.body;
        let hasPassword = await bcrypt.hash(password, 10);
        let newUser = new Users()
        newUser.name = name;
        newUser.email = email;
        newUser.password = hasPassword;
        let dataNewUser = await userRepository.save(newUser);
        if (dataNewUser) {
            return dataNewUser
        }
    }

    async search(req) {
        if (req.query.keyword) {
            const usersSearch = await userRepository.find({
                select: {
                    id: true,
                    email: true,
                    avatar: true,
                    name: true
                },
                where: {
                    name: Like(`%${req.query.keyword}%`),
                    id: Not(req.user.id)
                },
            });
            if (usersSearch) {
                return usersSearch
            }
        }
    }

    async handelUserOffLine(req) {
        let user = req.user;
        user.online = false;
        const data = await userRepository.save(user);
        if (data) {
            return data
        }
    }

    async handelUserOnLine(user) {
        user.online = true;
        user.lastActivity = new Date()
        const data = await userRepository.save(user);
        if (data) {
            return data
        }
    }

    async updatePassword(user, newPassword) {
        user.password = newPassword;
        const dataUser = await userRepository.save(user);
        if (dataUser) {
            return dataUser
        }
    }

    async makeFriend(req) {
        let user = await userRepository.findOneBy({id: req.user.id});
        let NewFriend = await userRepository.findOneBy({id: req.body.userId});
    }
}

export default new UserService();