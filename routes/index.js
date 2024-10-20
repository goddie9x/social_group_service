const router = require('express').Router();
const mapHealthStatusRoute = require('../utils/eureka/healthStatusRoute');
const groupController = require('../controllers/groupController');

mapHealthStatusRoute(router);
router.get('/normal-group',groupController.getGroupWhereUserIsMemberWithPaginate);
router.get('/privileged-group',groupController.getGroupsWhichUserManagerWithPaginate);
router.get('/join-request/:groupId',groupController.getJoinGroupRequestWithPaginate);
router.get('/with-members/:groupId',groupController.getAllMemberOfGroup);
router.get('/banned/:groupId',groupController.getAllBannedUserInGroup);
router.post('/create',groupController.createGroup);
router.patch('/accept/:requestId',groupController.acceptJoinRequest);
router.patch('/reject/:requestId',groupController.rejectJoinRequest);
router.post('/join',groupController.joinGroup);
router.delete('/leave/:id',groupController.leaveGroup);
router.patch('/update',groupController.updateGroup);
router.patch('/ban',groupController.banUserFromGroup);
router.patch('/un-ban',groupController.unbanUserFromGroup);
router.post('/appoint',groupController.appointUserForGroup);
router.delete('/kick',groupController.removeUserInGroup);
router.delete('/:id',groupController.deleteGroup);

module.exports = router;
