const BasicService = require('../utils/services/basicService');
const bindMethodsWithThisContext = require('../utils/classes/bindMethodsWithThisContext');
const Group = require('../models/group');
const GroupMember = require('../models/groupMember');
const { BadRequestException, TargetNotExistException, IncorrectPermission } = require('../utils/exceptions/commonExceptions');
const { ROLES } = require('../utils/constants/users');
const { updateObjectIfUpdateFieldDataDefined } = require('../utils/objects');

class GroupService extends BasicService {
    constructor() {
        super();
        bindMethodsWithThisContext(this);
    }
    async getGroupWhereUserIsMemberWithPaginate({ userId, page }) {
        const query = {
            user: userId,
            accepted: true,
            banned: false
        };
        const paginatedResults = await this.getPaginatedResults({
            model: GroupMember,
            query,
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
                $or: [{ admin: userId }, { mod: userId }]
            },
            page,
        });

        return paginatedResults;
    }
    async getJoinGroupRequestWithPaginate({ groupId, currentUser }) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new BadRequestException('Group not exist');
        }
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
        if (group.admin.contains(userId)) {
            return ROLES.ADMIN;
        }
        if (group.mod.contains(userId)) {
            return ROLES.MOD;
        }
        return null;
    }
    checkRoleOfCurrentUserInGroup({ currentUser, group }) {
        if (currentUser.role != ROLES.USER) {
            return currentUser.role;
        }
        return this.checkRoleOfUserInGroup({
            group,
            userId: currentUser.userId,
        })
    }
    checkCurrentUserCanModifyGroup({ currentUser, group }) {
        const role = this.checkRoleOfCurrentUserInGroup({ currentUser, group });
        if (!role) {
            throw new IncorrectPermission('You do not have permission');
        }
    }
    async updateGroup({ currentUser, groupId, name, description, avatar, cover, location, privacy, needApprovedToJoin }) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new BadRequestException('Group not exist');
        }
        this.checkCurrentUserCanModifyGroup({
            currentUser,
            group
        });
        updateObjectIfUpdateFieldDataDefined(group, { groupId, name, description, avatar, cover, location, privacy, needApprovedToJoin });
        return await group.save();
    }
    async deleteGroup({ id, currentUser }) {
        const group = await Group.findById(id);
        const role = this.checkRoleOfCurrentUserInGroup({ currentUser, group });
        if (role != ROLES.ADMIN) {
            throw new IncorrectPermission('You do not have permission');
        }
        //TODO: must delete all post in group also
        await GroupMember.deleteMany({
            group: group._id
        });
        await group.destroy();
    }
    async joinGroup({ id, currentUser }) {
        const group = await Group.findById(id);
        if (!group) {
            throw new BadRequestException('Group not exist');
        }
        const existRole = this.checkRoleOfUserInGroup({
            group,
            userId: currentUser.userId
        });
        if (existRole == ROLES.ADMIN || existRole == ROLES.MOD) {
            throw new BadRequestException('You are already in this group');
        }
        const groupMember = new GroupMember({
            group: group._id,
            user: currentUser.userId,
            accepted: !group.needApprovedToJoin
        });
        try {
            await groupMember.save();
        }
        catch (err) {
            console.log(err);
            throw new BadRequestException('Something went wrong or you has been banned from the group');
        }
    }

    async banUserFromGroup({ currentUser, userId, groupId }) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new BadRequestException('Group not exist');
        }
        this.checkCurrentUserCanModifyGroup({ currentUser, group });

        const groupMember = GroupMember.findOne({
            group: group._id,
            user: userId,
            banned: false,
        });
        if (!groupMember) {
            throw new BadRequestException('User does not in the group or has been banned');
        }
        groupMember.banned = true;
        await groupMember.save();
    }
    async leaveGroup({ id, currentUser }) {
        const group = await Group.findById(id);
        if (!group) {
            throw new BadRequestException('Group does not exist');
        }
    
        const role = this.checkRoleOfCurrentUserInGroup({ currentUser, group });
    
        if (role) {
            await this.removeUserInGroup({
                groupId: id,
                userId: currentUser.userId
            });
        } else {
            await this.removeMemberInGroup({
                userId: currentUser.userId,
                groupId: id
            });
        }
    }
    async appointUserForGroup({ id, userId, newRole, currentUser }) {
        //TODO: check userId exist first
        const group = await Group.findById(id);
        const currentUserRole = this.checkRoleOfCurrentUserInGroup({ currentUser, group });
        if (currentUserRole != ROLES.ADMIN) {
            throw new IncorrectPermission('You do not have permission');
        }
        if (newRole = ROLES.ADMIN) {
            group.admin.push(userId);
        }
        else if (newRole = ROLES.MOD) {
            group.mod.push(userId);
        }
        else {
            throw new BadRequestException('Invalid role specified');
        }
        await group.save();
    }
    async removeAdminOrModInGroup({ userId, group }) {
        const role = this.checkRoleOfUserInGroup({ userId, group });
    
        if (role === ROLES.ADMIN) {
            if (group.admin.length === 1) {
                throw new BadRequestException('You are the only admin, assign another admin before leaving');
            }
            group.admin = group.admin.filter(id => !id.equals(userId));
        } else if (role === ROLES.MOD) {
            group.mod = group.mod.filter(id => !id.equals(userId));
        } else {
            throw new BadRequestException('User is not an admin or mod in the group');
        }
    
        await group.save();
    }
    async removeMemberInGroup({ userId, currentUser, groupId }) {
        const groupMember = await GroupMember.findOneAndDelete({
            user: userId,
            group: groupId,
        });
        if (!groupMember) {
            throw new TargetNotExistException('You are not in the group');
        }
        return groupMember;
    }
    async removeUserInGroup({ groupId, userId }) {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new TargetNotExistException('Group does not exist');
        }
    
        const role = this.checkRoleOfUserInGroup({ userId, group });
    
        if (role) {
            await this.removeAdminOrModInGroup({ userId, group });
        }
    
        await this.removeMemberInGroup({ userId, groupId });
    }
}

module.exports = new GroupService();