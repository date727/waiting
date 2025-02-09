'use strict';
const db = uniCloud.database();
const customTimes = db.collection('custom_times');

exports.main = async (event, context) => {
  const { phone, password, items } = event;

  // 验证用户
  const user = await db.collection('users').where({ phone, password }).get();
  if (user.data.length === 0) {
    return {
      code: 401,
      message: '用户验证失败'
    };
  }

  // 查找phone对应的记录
  const existingRecord = await customTimes.where({ phone }).get();
  if (existingRecord.data.length === 0) {
    return {
      code: 404,
      message: '未找到用户记录'
    };
  }

  // 更新items数组
  const existingItems = existingRecord.data[0].items;
  const updatedItems = existingItems.concat(items); // 追加新食材

  const res = await customTimes.doc(existingRecord.data[0]._id).update({
    items: updatedItems, // 更新items数组
    updatedAt: new Date().getTime() // 更新更新时间戳
  });

  return {
    code: 200,
    message: '保存成功'
  };
};