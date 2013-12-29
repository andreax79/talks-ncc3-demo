Node.js + AngulaJS + MongoDB Test
=================================

Based on JP Richardson Demo from Nebraska Code Camp #3
"Let's Get CRUDdy: Building an App with AngularJS and Node.js"

Import the test data into MongoDB with:
```
node load_test_data.js
```

Start the server with:
```
node server
```
or with supervisor with:
```
supervisor -e 'html|js' node server
```

