'use strict';
const db = uniCloud.database();
const categories = db.collection('categories');

exports.main = async (event, context) => {
  const { phone, password } = event;

  // 验证用户
  const user = await db.collection('users').where({ phone, password }).get();
  if (user.data.length === 0) {
    return {
      code: 401,
      message: '用户验证失败'
    };
  }

  // 获取分类信息
  const res = await categories.where({ phone }).get();
  if (res.data.length > 0) {
    return {
      code: 200,
      data: res.data[0].categories
    };
  } else {
    return {
      code: 404,
      message: '未找到分类信息'
    };
  }
}; 