const express = require('express');
let app = express();
const port = process.env.PORT || 8080;

app.get("*", (req, res) => {
    res.status(404).send()
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});