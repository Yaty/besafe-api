
module.exports = async function(server) {
  let admin = await server.models.AppUser.findOne({
    username: 'admin',
  });

  if (admin) {
    return;
  }

  admin = await server.models.AppUser.create({
    username: 'admin',
    firstname: 'admin',
    lastname: 'admin',
    phone: 'admin',
    password: 'admin',
  });

  let role = await server.models.Role.findOne({
    name: 'admin',
  });

  if (role) {
    if (await role.principals.findOne({principalId: admin.id})) {
      return;
    }

    await role.principals.create({
      principalType: server.models.RoleMapping.USER,
      principalId: admin.id,
    });

    return;
  }

  role = await server.models.Role.create({
    name: 'admin',
  });

  if (await role.principals.findOne({principalId: admin.id})) {
    return;
  }

  await role.principals.create({
    principalType: server.models.RoleMapping.USER,
    principalId: admin.id,
  });

  console.log('Admin created');
};
