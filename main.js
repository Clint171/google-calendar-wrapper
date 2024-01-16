import express from 'express';

const app = express();

app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { title: 'Clints-planner : Welcome', message: 'Hello there!' });
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});