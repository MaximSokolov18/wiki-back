# Run project

1. Add BD to your PC (file in telegram group)
2. In db.js file change values for yourself
```javascript
const pool = new Pool({
  user: 'your user',
  host: 'localhost', // don't change
  database: 'your database',
  password: 'your pas',
  port: 5432, // don't change (default value)
});
```
3. Run "start" script in package.json file
