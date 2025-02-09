'use strict';
const db = uniCloud.database();
const categories = db.collection('categories');

exports.main = async (event, context) => {
  const { phone, password, category } = event;

  // 验证用户
  const user = await db.collection('users').where({ phone, password }).get();
  if (user.data.length === 0) {
    return {
      code: 401,
      message: '用户验证失败'
    };
  }

  // 查找phone对应的记录
  const existingRecord = await categories.where({ phone }).get();
  if (existingRecord.data.length === 0) {
    return {
      code: 404,
      message: '未找到用户记录'
    };
  }

  // 更新分类数组
  const existingCategories = existingRecord.data[0].categories;
  if (existingCategories.includes(category)) {
    return {
      code: 400,
      message: '分类已存在'
    };
  }

  // 追加新分类
  const updatedCategories = existingCategories.concat(category);

  // 更新数据库
  const res = await categories.doc(existingRecord.data[0]._id).update({
    categories: updatedCategories,
    updatedAt: new Date().getTime()
  });

  return {
    code: 200,
    message: '添加分类成功'
  };
};