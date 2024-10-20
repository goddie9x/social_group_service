const BasicService = require('../utils/services/basicService');
const bindMethodsWithThisContext = require('../utils/classes/bindMethodsWithThisContext');
const Group = require('../models/group');
const GroupMember = require('../models/groupMember');
const { BadRequestException, CommonException, TargetNotExistException, IncorrectPermission, TargetAlreadyExistException } = require('../utils/exceptions/commonExceptions');
const { ROLES } = require('../utils/constants/users');
const { updateObjectIfUpdateFieldDataDefined } = require('../utils/objects');
class GroupService extends BasicService {
    constructor() {
        super();
        bindMethodsWithThisContext(this);
    }
    async getGroupWhereUserIsMemberWithPaginate({ userId, page }) {
        const paginatedResults = await this.getPaginatedResults({
            model: GroupMember,
            query: {
                user: userId,
                accepted: true,
                banned: false
            },
            page,
            sort: { createdAt: -1 }
        });

        paginatedResults.results = await GroupMember.populate(paginatedResults.results, { path: 'group' });

        return paginatedResults;
    }

    async getGroupsWhichUserManagerWithPaginate({ userId, page }) {
        const paginatedResults = await this.getPaginatedResults({
            model: Group,
            query: {
                $or: [
                    { admin: userId },
                    { mod: userId }
                ]
            },
            page,
        });

        return paginatedResults;
    }
    async getJoinGroupRequestWithPaginate({ groupId, page, currentUser }) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new BadRequestException('Group not exist');
        }
        const result = await this.getPaginatedResults({
            model: GroupMember,
            query: {
                group: group._id,
                accepted: false,
                banned: false
            },
            page
        });
        return result;
    }
    async createGroup({ currentUser, name, description, privacy, needApprovedToJoin }) {
        const group = new Group({
            name,
            admin: [currentUser.userId],
            description,
            needApprovedToJoin,
            privacy
        });

        return await group.save();
    }
    checkRoleOfUserInGroup({ userId, group }) {
        if (group.admin.find(x => x.equals(userId))) {
            return ROLES.ADMIN;
        }
        if (group.mod.find(x => x.equals(userId))) {
            return ROLES.MOD;
        }
        return null;
    }
    checkRoleOfCurrentUserInGroup({ currentUser, group }) {
        if (currentUser.role !== ROLES.USER) {
            return currentUser.role;
        }
        return this.checkRoleOfUserInGroup({
            group,
            userId: currentUser.userId,
        })
    }
    checkCurrentUserCanModifyGroup({ currentUser, group }) {
        const role = this.checkRoleOfCurrentUserInGroup({ currentUser, group });
        if (role !== ROLES.ADMIN && role !== ROLES.MOD) {
            throw new IncorrectPermission('You do not have permission');
        }
    }
    async updateGroup({ currentUser, groupId, name, description, avatar, cover, location, privacy, needApprovedToJoin, needApprovedToPost }) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new TargetNotExistException('Group not exist');
        }
        this.checkCurrentUserCanModifyGroup({
            currentUser,
            group
        });
        updateObjectIfUpdateFieldDataDefined(group, { groupId, name, description, avatar, cover, location, privacy, needApprovedToJoin, needApprovedToPost });
        //TODO: push notification for all member of group including other admin mod
        return await group.save();
    }
    async deleteGroup({ id, currentUser }) {
        const group = await Group.findById(id);
        if (!group) {
            throw new TargetNotExistException('Group not exist');
        }
        const role = this.checkRoleOfCurrentUserInGroup({ currentUser, group });
        if (role !== ROLES.ADMIN) {
            throw new IncorrectPermission('You do not have permission');
        }
        //TODO: must delete all post in group also
        //Push notification to all member
        await GroupMember.deleteMany({
            group: group._id
        });
        await Group.findByIdAndDelete(group._id);
    }
    async joinGroup({ id, currentUser }) {
        const group = await Group.findById(id);
        if (!group) {
            throw new TargetNotExistException('Group not exist');
        }
        const existRole = this.checkRoleOfUserInGroup({
            group,
            userId: currentUser.userId
        });
        if (existRole === ROLES.ADMIN || existRole === ROLES.MOD) {
            throw new TargetAlreadyExistException('You are already in this group');
        }
        const existJoinRequest = await GroupMember.findOne({
            group: group._id,
            user: currentUser.userId,
        });

        if (existJoinRequest) {
            if (existJoinRequest.accepted) {
                throw new TargetAlreadyExistException('You have already in this group');
            }
            throw new TargetAlreadyExistException('You have sent join request, you do not need to send it again');
        }
        const groupMember = new GroupMember({
            group: group._id,
            user: currentUser.userId,
            accepted: !group.needApprovedToJoin
        });

        try {
            await groupMember.save();
            //PUSH notification for admin/mod
        }
        catch (err) {
            console.log(err);
            throw new BadRequestException('Something went wrong or you has been banned from the group');
        }
    }
    async acceptJoinRequest({ id, currentUser }) {
        const request = await GroupMember.findById(id);

        if (!request) {
            throw new TargetNotExistException('Request not exist');
        }
        if (request.banned) {
            throw new IncorrectPermission('The user have been banned of this group');
        }
        if (request.accepted) {
            throw new BadRequestException('Request already accepted');
        }
        const group = await Group.findById(request.group);
        if (!group) {
            await GroupMember.deleteMany({ group: request.group });
            throw new CommonException('The request is invalid');
        }
        this.checkCurrentUserCanModifyGroup({ currentUser, group });

        request.accepted = true;
        await request.save();
        //TODO: push notification to the user
    }
    async rejectJoinRequest({ id, currentUser }) {
        const request = await GroupMember.findById(id);

        if (!request) {
            throw new TargetNotExistException('Request not exist');
        }
        if (request.banned) {
            throw new IncorrectPermission('The user have been banned of this group');
        }
        if (request.accepted) {
            throw new BadRequestException('Request already accepted');
        }
        const group = await Group.findById(request.group);
        if (!group) {
            await GroupMember.deleteMany({ group: request.group });
            throw new CommonException('The request is invalid');
        }
        this.checkCurrentUserCanModifyGroup({ currentUser, group });

        await GroupMember.findByIdAndDelete(request._id);
        //TODO: push notification to the user
    }
    async getAllUserInGroup({ currentUser, page, groupId }) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new BadRequestException('Group not exist');
        }
        const members = await this.getPaginatedResults({
            model: GroupMember,
            query: {
                group: group._id,
                accepted: true,
                banned: false,
            },
            page,
        });
        const result = {
            ...group.toObject(),
            members,
        };

        return result;
    }
    async getAllBannedUserInGroup({ currentUser, page, groupId }) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new BadRequestException('Group not exist');
        }
        const members = await this.getPaginatedResults({
            model: GroupMember,
            query: {
                group: group._id,
                banned: true,
            },
            page,
        });
        const result = {
            ...group.toObject(),
            members,
        };

        return result;
    }
    async toggleBanUserFromGroup({ currentUser, userId, groupId, banned = true }) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new BadRequestException('Group not exist');
        }
        this.checkCurrentUserCanModifyGroup({ currentUser, group });

        const groupMember = await GroupMember.findOne({
            group: group._id,
            user: userId,
        });
        if (!groupMember) {
            throw new BadRequestException('User does not in the group');
        }
        if (groupMember.banned == banned) {
            throw new TargetAlreadyExistException('The user already have been ' + (banned ? 'banned' : 'un banned'));
        }
        groupMember.banned = banned;
        await groupMember.save();
    }
    async appointUserForGroup({ id, userId, newRole, currentUser }) {
        //TODO: check userId exist first
        const group = await Group.findById(id);
        const currentUserRole = this.checkRoleOfCurrentUserInGroup({ currentUser, group });
        if (currentUserRole !== ROLES.ADMIN) {
            throw new IncorrectPermission('You do not have permission');
        }
        if (newRole === ROLES.ADMIN) {
            group.admin.push(userId);
        }
        else if (newRole === ROLES.MOD) {
            group.mod.push(userId);
        }
        else {
            throw new BadRequestException('Invalid role specified');
        }
        await group.save();
        //TODO: push notification to the user
    }
    async removeAdminOrModInGroup({ userId, currentUser, group }) {
        const currentUserRoleOfTheGroup = this.checkRoleOfUserInGroup({ userId: currentUser.userId, group });

        if (currentUserRoleOfTheGroup !== ROLES.ADMIN) {
            throw new IncorrectPermission();
        }
        const role = this.checkRoleOfUserInGroup({ userId, group });

        if (role === ROLES.ADMIN) {
            if (group.admin.length == 1) {
                throw new BadRequestException('You are the only admin, assign another admin before leaving');
            }
            group.admin = group.admin.filter(id => !id.equals(userId));
        } else if (role === ROLES.MOD) {
            group.mod = group.mod.filter(id => !id.equals(userId));
        } else {
            throw new BadRequestException('User is not an admin or mod in the group');
        }
        await group.save();
        //TODO: push notification for the user
    }
    async removeMemberInGroup({ userId, currentUser, group }) {
        const currentUserRoleOfTheGroup = this.checkRoleOfUserInGroup({ userId: currentUser.userId, group });

        if (userId != currentUser.userId && currentUserRoleOfTheGroup !== ROLES.ADMIN && currentUserRoleOfTheGroup !== ROLES.MOD) {
            throw new IncorrectPermission();
        }
        const groupMember = await GroupMember.findOneAndDelete({
            user: userId,
            group: group._id,
        });
        if (!groupMember) {
            throw new TargetNotExistException('The user are not in the group');
        }
        //TODO: push notification to the user
        return groupMember;
    }
    async removeUserInGroup({ groupId, currentUser, userId }) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new TargetNotExistException('Group does not exist');
        }

        const role = this.checkRoleOfUserInGroup({ userId, group });
        if (role === ROLES.ADMIN || role === ROLES.MOD) {
            await this.removeAdminOrModInGroup({ userId, currentUser, group });
        }
        else {
            await this.removeMemberInGroup({ userId, currentUser, group });
        }
    }
}

module.exports = new GroupService();