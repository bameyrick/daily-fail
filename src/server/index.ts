import * as path from 'path';
import * as express from 'express';
import { generateRandomStory, IStory } from './story-generator';
import { articleUrls, getStoryByUrl, shareStory } from './story-manager';

const server = express();

const development = process.env.NODE_ENV === 'development';

server.set('port', process.env.PORT || 3000);
server.set('view engine', 'pug');
server.set('views', path.join(process.cwd(), '/build/views'));

server.use(express.static(path.join(process.cwd(), '/build')));

server.get('/share', async (request, response) => {
  const url = request.query.url;

  if (url) {
    shareStory(url)
      .then(async () => {
        const story = await getStoryByUrl(url);

        response.json(story);
      })
      .catch(error => {
        console.log(error);
        response.statusCode = 500;
        response.send();
      });
  } else {
    response.statusCode = 500;
    response.send();
  }
});

server.get('*', async (request, response) => {
  const url = request.originalUrl.slice(1).split('?')[0];

  if (url) {
    if (articleUrls[url]) {
      const story = await getStoryByUrl(url);

      if (story) {
        const structuredData = generateStructuredData(story);

        response.render('index', { ...story, structuredData, development, meta: generateMeta(story) });
        return;
      }

      response.redirect('/');
    }
  } else {
    const story = generateRandomStory();
    const structuredData = generateStructuredData(story);

    response.render('index', { ...story, structuredData, development, meta: generateMeta() });
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
    image: ['https://daily-fail-generator.herokuapp.com/assets/banner.png'],
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

interface IMeta {
  title: string;
  url: string;
  headline: string;
  description: string;
}

function generateMeta(story?: IStory): IMeta {
  if (story) {
    return {
      title: `${story.headline} – Daily Fail`,
      url: `https://daily-fail-generator.herokuapp.com/${story.url}`,
      headline: story.headline,
      description: `${story.headline} by Daily Fail Generator`,
    };
  } else {
    return {
      title: `Daily Fail – Daily Mail Article Generator`,
      url: `https://daily-fail-generator.herokuapp.com/`,
      headline: `Daily Fail – Daily Mail Article Generator`,
      description: `Generates a new load of nonsense every time you refresh the page`,
    };
  }
}

const port = server.get('port');
const env = server.get('env');

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port} in ${env} mode`);
});
