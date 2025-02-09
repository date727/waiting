'use strict';
const db = uniCloud.database();
const customTimes = db.collection('custom_times');

exports.main = async (event, context) => {
  const { phone, password } = event;
  
  console.log('开始执行get-custom-times云函数'); // 添加调试日志

  // 验证用户
  const user = await db.collection('users').where({ phone, password }).get();
  if (user.data.length === 0) {
    return {
      code: 401,
      message: '用户验证失败'
    };
  }

  // 获取用户自定义食材
  const res = await customTimes.where({ phone }).get();
  console.log('查询结果:', res); // 添加调试日志
  if (res.data.length > 0) {
    return {
      code: 200,
      data: res.data[0].items
    };
  } else {
    return {
      code: 404,
      message: '未找到自定义食材'
    };
  }
}; 