import { firestore } from './firestore';
import { storyStyles, scapegoats, evilBehaviours, quotes, rightWingers, IEvilBehaviour } from './content';

interface Story {
  development?: boolean;
  headline: string;
  story: string;
  published: Date;
  publishedDisplay: string;
  url: string;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function generateRandomStory(): Story {
  const storyStyle = getRandomItem(storyStyles);
  const scapegoat = getRandomItem(scapegoats);
  const evil = getRandomItem(evilBehaviours);
  const evil2 = getRandomItem(evilBehaviours.filter(e => JSON.stringify(e) !== JSON.stringify(evil)));
  const quote = getRandomItem(quotes);
  const rightWinger = getRandomItem(rightWingers);

  const headline = injectQuotes(storyStyle.headline, scapegoat, evil, evil2, quote, rightWinger).replace(/\s\s+/g, ' ');
  const story = injectQuotes(storyStyle.story, scapegoat, evil, evil2, quote, rightWinger).replace(/\s\s+/g, ' ');

  const published = new Date();
  const publishedDisplay = formatDate(published);
  const url = headline
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"]/g, '')
    .replace(/ /g, '-')
    .toLowerCase();

  const result = {
    headline,
    story,
    published,
    publishedDisplay,
    url,
  };

  firestore
    .collection('stories')
    .doc(url)
    .set(result);

  return result;
}

function getRandomItem(array: any[]): any {
  return array[Math.floor(Math.random() * array.length)];
}

function injectQuotes(
  text: string,
  scapegoat: string,
  evil: IEvilBehaviour,
  evil2: IEvilBehaviour,
  quote: string,
  rightWinger: string
): string {
  return text
    .replace(/%s/g, scapegoat)
    .replace(/%S/g, capitaliseFirstLetter(scapegoat))
    .replace(/%e2/g, evil2.past)
    .replace(/%E2/g, capitaliseFirstLetter(evil2.past))
    .replace(/%e/g, evil.past)
    .replace(/%E/g, capitaliseFirstLetter(evil.past))
    .replace(/%pe2/g, evil2.present)
    .replace(/%PE2/g, capitaliseFirstLetter(evil2.present))
    .replace(/%pe/g, evil.present)
    .replace(/%PE/g, capitaliseFirstLetter(evil.present))
    .replace(/%q/g, quote)
    .replace(/%Q/g, capitaliseFirstLetter(quote))
    .replace(/%r/g, rightWinger)
    .replace(/%R/g, capitaliseFirstLetter(rightWinger));
}

function capitaliseFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatDate(date: Date): string {
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  let hour: string | number = date.getHours();
  let minute: string | number = date.getMinutes();

  if (hour < 10) {
    hour = `0${hour}`;
  }

  if (minute < 10) {
    minute = `0${minute}`;
  }

  return `${day} ${month} ${year} at ${hour}:${minute}`;
}
