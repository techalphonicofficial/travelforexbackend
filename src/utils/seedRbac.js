const { NAV_ITEMS, flattenNavItems } = require('./rbacConfig');

const uniqueBy = (items, getKey) => {
  const map = new Map();
  items.forEach(item => {
    const key = getKey(item);
    if (key && !map.has(key)) map.set(key, item);
  });
  return [...map.values()];
};

async function seedRbac({ Module, Permission, Role } = {}) {
  if (!Module || !Permission) return { modules: 0, permissions: 0 };

  const modules = uniqueBy(flattenNavItems(NAV_ITEMS), item => item.module)
    .filter(item => item.module)
    .map(item => item.module);
  const moduleByName = new Map();

  for (const name of modules) {
    const [moduleRow] = await Module.findOrCreate({ where: { name }, defaults: { name } });
    moduleByName.set(name, moduleRow);
  }

  const permissionItems = uniqueBy(flattenNavItems(NAV_ITEMS), item => `${item.module}:${item.permission}`)
    .filter(item => item.module && item.permission);
  const permissions = [];

  for (const item of permissionItems) {
    const moduleRow = moduleByName.get(item.module);
    if (!moduleRow) continue;
    const [permission] = await Permission.findOrCreate({
      where: { name: item.permission },
      defaults: { name: item.permission, module_id: moduleRow.id }
    });
    if (permission.module_id !== moduleRow.id) {
      await permission.update({ module_id: moduleRow.id });
    }
    permissions.push(permission);
  }

  if (Role) {
    const adminRoles = await Role.findAll({ where: { name: ['System Admin', 'Admin', 'Super Admin'] } }).catch(() => []);
    for (const role of adminRoles) {
      if (typeof role.addPermissions === 'function') {
        await role.addPermissions(permissions).catch(() => null);
      }
    }
  }

  return { modules: modules.length, permissions: permissions.length };
}

module.exports = seedRbac;
