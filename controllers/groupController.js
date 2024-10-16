const groupService = require('../services/groupService');
const BasicController = require('../utils/controllers/basicController');
const bindMethodsWithThisContext = require('../utils/classes/bindMethodsWithThisContext');

class GroupController extends BasicController {
    constructor() {
        super();
        bindMethodsWithThisContext(this);
    }
    async getGroupWhereUserIsMemberWithPaginate(req, res) {
        try {
            const results = await groupService.getGroupWhereUserIsMemberWithPaginate(req.query);

            return res.status(200).json({ ...results });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async getGroupsWhichUserManagerWithPaginate(req, res) {
        try {
            const results = await groupService.getGroupsWhichUserManagerWithPaginate(req.query);

            return res.status(200).json({ ...results });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async getJoinGroupRequestWithPaginate(req, res) {
        try {
            const results = await groupService.getJoinGroupRequestWithPaginate(req.params);

            return res.status(200).json({ ...results });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async createGroup(req, res) {
        try {
            const group = await groupService.createGroup(req.body);

            return res.status(201).json(group);
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async updateGroup(req, res) {
        try {
            const group = await groupService.updateGroup(req.body);

            return res.status(201).json(group);
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async joinGroup(req, res) {
        try {
            await groupService.joinGroup(req.body);

            res.status(201).json({ message: 'Join group successful' });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async leaveGroup(req, res) {
        try {
            await groupService.leaveGroup({ ...req.body, ...req.params });

            return res.status(201).json({ message: 'Leave group successful' });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async appointUserForGroup(req, res) {
        try {
            const group = await groupService.appointUserForGroup(req.body);

            return res.status(201).json(group);
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async banUserFromGroup(req, res) {
        try {
            const groupMember = await groupService.banUserFromGroup(req.body);

            return res.status(201).json(groupMember);
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async deleteGroup(req, res) {
        try {
            const deletedGroup = await groupService.deleteGroup(req.body);

            return res.status(201).json(deletedGroup);
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async removeUserInGroup(req, res) {
        try {
            await groupService.removeUserInGroup(req.body);
            res.status(201).json({
                message: 'Remove user successful'
            })
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
}

module.exports = new GroupController();