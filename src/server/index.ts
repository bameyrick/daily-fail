import * as path from 'path';
import * as express from 'express';
import { generateRandomStory, IStory } from './story-generator';
import { firestore } from './firestore';

const server = express();

const development = process.env.NODE_ENV === 'development';

server.set('port', process.env.PORT || 3000);
server.set('view engine', 'pug');
server.set('views', path.join(process.cwd(), '/build/views'));

server.use(express.static(path.join(process.cwd(), '/build')));

server.get('*', async (request, response) => {
  const url = request.originalUrl.slice(1).split('?')[0];

  if (url) {
    const doc = await firestore
      .collection('stories')
      .doc(url)
      .get();

    if (doc) {
      const story = (await doc.data()) as IStory;

      if (story) {
        const structuredData = generateStructuredData(story);

        response.render('index', { ...story, structuredData, development });
        return;
      }

      response.redirect('/');
    }
  } else {
    const story = generateRandomStory();
    const structuredData = generateStructuredData(story);

    response.render('index', { ...story, structuredData, development });
  }
});

function generateStructuredData(story: IStory): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://daily-fail-generator.herokuapp.com/${story.url}`,
    },
    headline: story.headline,
    datePublished: story.published,
    dateModified: story.published,
    image: ['https://daily-fail-generator.herokuapp.com/assests/banner.png'],
    author: {
      '@type': 'Person',
      name: 'Daily Fail Generator',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Daily Fail Generator',
      logo: {
        '@type': 'ImageObject',
        url: 'https://daily-fail-generator.herokuapp.com/assets/favicon.png',
      },
    },
    description: `${story.headline} – By Daily Fail Generator`,
  };

  return JSON.stringify(data);
}

const port = server.get('port');
const env = server.get('env');

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port} in ${env} mode`);
});
