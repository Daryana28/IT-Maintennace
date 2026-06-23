// be/src/modules/user/userService.js
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { User, Role, UserRole } from "../../models/index.js";

const SALT_ROUNDS = 10;

const getAll = async (query = {}) => {
    const {
        page = 1,
        pageSize = 10,
        search = "",
        is_active,
    } = query;

    const where = {};

    if (search) {
        where[Op.or] = [
            { username: { [Op.like]: `%${search}%` } },
            { full_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
        ];
    }

    if (is_active !== undefined && is_active !== "") {
        where.is_active = is_active === "true" || is_active === true;
    }

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize, 10);

    const { count: total, rows } = await User.findAndCountAll({
        where,
        include: [
            {
                model: Role,
                as: "roles",
                attributes: ["role_id", "role_name"],
                through: { attributes: [] },
            },
        ],
        attributes: { exclude: ["password_hash"] },
        offset,
        limit,
        order: [["created_at", "DESC"]],
    });

    return {
        rows,
        total,
        page: parseInt(page, 10),
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
    };
};

const getById = async (id) => {
    return await User.findByPk(id, {
        include: [
            {
                model: Role,
                as: "roles",
                attributes: ["role_id", "role_name"],
                through: { attributes: [] },
            },
        ],
        attributes: { exclude: ["password_hash"] },
    });
};

const create = async (data) => {
    const { username, full_name, email = `${username}@ikoito.co.id `, password, role_ids = [], is_active = true } = data;

    const existing = await User.findOne({
        where: { username },
    });

    if (existing) {
        const err = new Error("Username already exists");
        err.status = 409;
        throw err;
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
        company_id: 1,
        username,
        full_name,
        email,
        password_hash,
        is_active,
        created_at: new Date(),
    });

    if (role_ids.length > 0) {
        const roleRecords = await Role.findAll({
            where: { role_id: role_ids },
        });

        await user.setRoles(roleRecords);
    }

    return await getById(user.user_id);
};

const update = async (id, data) => {
    const user = await User.findByPk(id);

    if (!user) return null;

    const { username, full_name, email, password, role_ids, is_active } = data;

    if (username && username !== user.username) {
        const existing = await User.findOne({ where: { username } });
        if (existing && existing.user_id !== parseInt(id)) {
            const err = new Error("Username already taken");
            err.status = 409;
            throw err;
        }
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (password) {
        updateData.password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    await User.update(updateData, { where: { user_id: id } });

    if (role_ids !== undefined) {
        const roleRecords = await Role.findAll({
            where: { role_id: role_ids },
        });

        await user.setRoles(roleRecords);
    }

    return await getById(id);
};

const remove = async (id) => {
    const user = await User.findByPk(id);

    if (!user) return null;

    await UserRole.destroy({ where: { user_id: id } });
    await User.destroy({ where: { user_id: id } });

    return true;
};

export default {
    getAll,
    getById,
    create,
    update,
    remove,
};