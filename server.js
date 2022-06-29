
const express = require('express');
const app = express();

app.get('/json', async (_, res) => {
    const array = [];
    res.write('[');
    for (let i = 0; i < 100; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (i) res.write(',');
        res.write(JSON.stringify({ message: `Hello ${i}` }));
    }
    res.write(']');
    res.end();
});

app.use(express.static('.'));

app.listen(3000);
