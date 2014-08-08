module.exports = function (app) {
    // 404s
    app.use(function (req, res, next) {
        res.status(404);

        if (req.accepts('html')) {
            return res.send("<h2>Извините, но я не могу найти эту страницу.</h2>");
        }

        if (req.accepts('json')) {
            return res.json({ error: 'Not found' });
        }

        // default response type
        res.type('txt');
        res.send("Не могу найти страницу.");
    })

    // 500
    app.use(function (err, req, res, next) {
        console.error('error at %s\n', req.url, err.stack);
        res.send(500, "Обнаружена ошибка в работе сервера. Обратитесь к Администратору.");
    })
}
