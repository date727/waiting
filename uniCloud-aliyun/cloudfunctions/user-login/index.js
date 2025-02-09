const db = uniCloud.database();
const users = db.collection('users');
const custom_times = db.collection('custom_times');
const categories = db.collection('categories');

exports.main = async (event, context) => {
  const { phone, password } = event;

  // 查询用户是否存在
  const user = await users.where({ phone }).get();

  if (user.data.length === 0) {
    // 用户不存在，创建新用户
    const res = await users.add({
      phone,
      password,
      createdAt: new Date().getTime()
    });

    const exampleItems = [
      { name: '牛肉', time: 30, category: '肉类' },
      { name: '青菜', time: 10, category: '蔬菜' },
      { name: '虾', time: 20, category: '海鲜' }
    ];

    // 创建默认分类
    const defaultCategories = ['肉类', '蔬菜', '海鲜'];

    await Promise.all([
      custom_times.add({
        phone,
        items: exampleItems,
        createdAt: new Date().getTime()
      }),
      categories.add({
        phone,
        categories: defaultCategories,
        createdAt: new Date().getTime()
      })
    ]);

    return {
      code: 200,
      message: '注册成功',
      token: res.id // 返回用户ID作为token
    };
  } else {
    // 用户存在，验证密码
    if (user.data[0].password === password) {
      return {
        code: 200,
        message: '登录成功',
        token: user.data[0]._id // 返回用户ID作为token
      };
    } else {
      return {
        code: 401,
        message: '密码错误'
      };
    }
  }
};