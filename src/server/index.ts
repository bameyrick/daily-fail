import * as path from 'path';
import * as express from 'express';
import { generateRandomStory } from './story-generator';
import { firestore } from './firestore';

const server = express();

const development = process.env.NODE_ENV === 'development';

server.set('port', process.env.PORT || 3000);
server.set('view engine', 'pug');
server.set('views', path.join(process.cwd(), '/build/views'));

server.use(express.static(path.join(process.cwd(), '/build')));

server.get('*', async (request, response) => {
  const url = request.originalUrl.slice(1);

  if (url) {
    const doc = await firestore
      .collection('stories')
      .doc(url)
      .get();

    if (doc) {
      const story = await doc.data();

      if (story) {
        response.render('index', { ...story, development });
        return;
      }

      response.redirect('/');
    }
  } else {
    const story = generateRandomStory();

    response.render('index', { ...story, development });
  }
});

const port = server.get('port');
const env = server.get('env');

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port} in ${env} mode`);
});
