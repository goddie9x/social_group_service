const router = require('express').Router();
const mapHealthStatusRoute = require('../utils/eureka/healthStatusRoute');
const groupController = require('../controllers/groupController');

mapHealthStatusRoute(router);
router.get('/normal-group',groupController.getGroupWhereUserIsMemberWithPaginate);
router.get('/privileged-group',groupController.getGroupsWhichUserManagerWithPaginate);
router.get('/join-request/:groupId',groupController.getJoinGroupRequestWithPaginate);
router.post('/create',groupController.createGroup);
router.post('/join',groupController.joinGroup);
router.delete('/leave/:id',groupController.leaveGroup);
router.patch('/update',groupController.updateGroup);
router.post('/ban',groupController.banUserFromGroup);
router.post('/appoint',groupController.appointUserForGroup);
router.delete('/kick',groupController.removeUserInGroup);
router.delete('/delete',groupController.deleteGroup);

module.exports = router;
