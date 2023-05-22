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

Зразок json для добавлення нової статті:
```json
{
  "a_name": "PostgreSQL",
  "topic": "Бази даних",
  "keywords": [
    "SQL",
    "реляційна модель даних",
    "додаток",
    "система управління базами даних"
  ],
  "content": "PostgreSQL є реляційною системою управління базами даних з відкритим вихідним кодом, яка дозволяє зберігати та керувати великими об'ємами даних. PostgreSQL є однією з найбільш розширюваних та надійних систем управління базами даних, і є популярним вибором для багатьох організацій та розробників програмного забезпечення. Вона підтримує багато мов програмування та має велику кількість функцій та можливостей.",
  "link": "https://uk.wikipedia.org/wiki/PostgreSQL"
}
```
