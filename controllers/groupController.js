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
            const payloads = {
                ...req.query,
                userId: req.body.currentUser.userId
            }
            const results = await groupService.getGroupWhereUserIsMemberWithPaginate(payloads);

            return res.status(200).json({ ...results });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async getGroupsWhichUserManagerWithPaginate(req, res) {
        try {
            const payloads = {
                ...req.query,
                userId: req.body.currentUser.userId
            }
            const results = await groupService.getGroupsWhichUserManagerWithPaginate(payloads);

            return res.status(200).json({ ...results });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async getJoinGroupRequestWithPaginate(req, res) {
        try {
            const results = await groupService.getJoinGroupRequestWithPaginate({ ...req.query, ...req.params, ...req.body });

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
    async acceptJoinRequest(req, res) {
        try {
            const payloads = {
                currentUser: req.body.currentUser,
                id: req.params.requestId
            }
            await groupService.acceptJoinRequest(payloads);

            res.status(201).json({ message: 'Accept join group request successful' });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async rejectJoinRequest(req, res) {
        try {
            const payloads = {
                currentUser: req.body.currentUser,
                id: req.params.requestId
            }
            await groupService.rejectJoinRequest(payloads);

            res.status(201).json({ message: 'Reject join group request successful' });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async getAllMemberOfGroup(req, res) {
        try {
            const payloads = {
                groupId: req.params.groupId,
                currentUser: req.body.currentUser,
                page: req.query.page
            };
            const result = await groupService.getAllUserInGroup(payloads);

            return res.status(200).json(result);
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async leaveGroup(req, res) {
        try {
            const currentUser = req.body.currentUser;
            const payloads = {
                groupId: req.params.id,
                currentUser,
                userId: currentUser.userId
            };

            await groupService.removeUserInGroup(payloads);
            return res.status(201).json({ message: 'Leave group successful' });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async appointUserForGroup(req, res) {
        try {
            await groupService.appointUserForGroup(req.body);
            return res.status(201).json({ message: 'Appoint user successful' });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async getAllBannedUserInGroup(req, res) {
        try {
            const result = await groupService.getAllBannedUserInGroup({ ...req.query, ...req.params });
            
            res.status(200).json(result);
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async banUserFromGroup(req, res) {
        try {
            await groupService.toggleBanUserFromGroup({ ...req.body, banned: true });

            return res.status(201).json({
                message:'Ban user successful'
            });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async unbanUserFromGroup(req, res) {
        try {
            await groupService.toggleBanUserFromGroup({ ...req.body, banned: false });

            return res.status(201).json({
                message:'Un ban user successful'
            });
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async deleteGroup(req, res) {
        try {
            const deletedGroup = await groupService.deleteGroup({ id: req.params.id, ...req.body });

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