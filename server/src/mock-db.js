let releases = [
  {
    id: 1,
    name: 'Version 1.0.1',
    releaseDate: new Date('2022-09-20'),
    additionalInfo: 'Initial stable release',
    stepState: {
      github_prs_merged: true,
      changelog_updated: true,
      all_tests_passing: true,
      release_created: true,
      deployed_in_demo: true,
      tested_in_demo: true,
      deployed_in_production: true,
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let nextId = 2;

const sql = async (strings, ...values) => {
  if (!Array.isArray(strings)) {
      // Handle the sql(update, ...) case or sql.json case
      return strings; // This is a bit simplified
  }

  const query = strings.join('?').toLowerCase();
  
  if (query.includes('select * from releases')) {
    if (query.includes('where id =')) {
      const id = values[0];
      return releases.filter(r => r.id === parseInt(id));
    }
    return [...releases].sort((a, b) => b.releaseDate - a.releaseDate);
  }
  
  if (query.includes('insert into releases')) {
    const [name, releaseDate, additionalInfo, stepStateJson] = values;
    
    // Check for duplicates in mock
    if (releases.some(r => r.name === name)) {
      const err = new Error('Duplicate key');
      err.code = 11000;
      throw err;
    }

    const newRelease = {
      id: nextId++,
      name,
      releaseDate: new Date(releaseDate),
      additionalInfo,
      stepState: typeof stepStateJson === 'string' ? JSON.parse(stepStateJson) : stepStateJson,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    releases.push(newRelease);
    return [newRelease];
  }
  
  if (query.includes('update releases')) {
    // Very simplified update logic
    const id = values[values.length - 1];
    const index = releases.findIndex(r => r.id === parseInt(id));
    if (index === -1) return [];
    
    const updateObj = values[0]; // Assuming first value is the update object in sql(...)
    if (typeof updateObj === 'object' && updateObj !== null) {
      Object.keys(updateObj).forEach(key => {
          // Convert snake_case from SQL to camelCase for JS if needed
          const jsKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
          releases[index][jsKey] = updateObj[key];
      });
    }
    releases[index].updatedAt = new Date();
    return [releases[index]];
  }

  if (query.includes('delete from releases')) {
    const id = values[0];
    const item = releases.find(r => r.id === parseInt(id));
    releases = releases.filter(r => r.id !== parseInt(id));
    return item ? [{ id: item.id }] : [];
  }

  return [];
};

sql.json = (obj) => {
    return typeof obj === 'string' ? obj : JSON.stringify(obj);
};

sql.end = async () => {};

// Handle the complex case: sql(update, 'name', 'release_date', ...)
const sqlProxy = new Proxy(sql, {
    apply(target, thisArg, argArray) {
        if (argArray.length > 1 && typeof argArray[0] === 'object' && !Array.isArray(argArray[1])) {
            // This is sql(object, ...keys) which returns the object filtered or just the object
            return argArray[0];
        }
        return target.apply(thisArg, argArray);
    }
});

module.exports = sqlProxy;
