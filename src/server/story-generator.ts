import { storyStyles, scapegoats, evilBehaviours, quotes, rightWingers, IEvilBehaviour } from './content';
import { cacheStory } from './story-manager';

export interface IStory {
  development?: boolean;
  headline: string;
  story: string;
  published: Date;
  publishedDisplay: string;
  url: string;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function generateRandomStory(): IStory {
  const storyStyle = getRandomItem(storyStyles);
  const scapegoat = getRandomItem(scapegoats);
  const scapegoat2 = getRandomItem(scapegoats.filter(s => s !== scapegoat));
  const evil = getRandomItem(evilBehaviours);
  const evil2 = getRandomItem(evilBehaviours.filter(e => JSON.stringify(e) !== JSON.stringify(evil)));
  const quote = getRandomItem(quotes);
  const rightWinger = getRandomItem(rightWingers);
  const rightWinger2 = getRandomItem(rightWingers.filter(r => r !== rightWinger));

  const headline = injectQuotes(storyStyle.headline, scapegoat, scapegoat2, evil, evil2, quote, rightWinger, rightWinger2).replace(
    /\s\s+/g,
    ' '
  );
  const story = injectQuotes(storyStyle.story, scapegoat, scapegoat2, evil, evil2, quote, rightWinger, rightWinger2).replace(/\s\s+/g, ' ');

  const published = new Date();
  const publishedDisplay = formatDate(published);
  const url = headline
    .trim()
    .replace(/[.,\/#!?'$%\^&\*;:{}=\-_`~()"]/g, '')
    .replace(/ /g, '-')
    .toLowerCase();

  const result = {
    headline,
    story,
    published,
    publishedDisplay,
    url,
  };

  cacheStory(result);

  return result;
}

function getRandomItem(array: any[]): any {
  return array[Math.floor(Math.random() * array.length)];
}

function injectQuotes(
  text: string,
  scapegoat: string,
  scapegoat2: string,
  evil: IEvilBehaviour,
  evil2: IEvilBehaviour,
  quote: string,
  rightWinger: string,
  rightWinger2: string
): string {
  return text
    .replace(/%scapegoat2/g, scapegoat2)
    .replace(/%Scapegoat2/g, capitaliseFirstLetter(scapegoat2))
    .replace(/%scapegoat/g, scapegoat)
    .replace(/%Scapegoat/g, capitaliseFirstLetter(scapegoat))
    .replace(/%evil2/g, evil2.past)
    .replace(/%Evil2/g, capitaliseFirstLetter(evil2.past))
    .replace(/%evil/g, evil.past)
    .replace(/%Evil/g, capitaliseFirstLetter(evil.past))
    .replace(/%present2/g, evil2.present)
    .replace(/%Present2/g, capitaliseFirstLetter(evil2.present))
    .replace(/%present/g, evil.present)
    .replace(/%Present/g, capitaliseFirstLetter(evil.present))
    .replace(/%quote/g, quote)
    .replace(/%Quote/g, capitaliseFirstLetter(quote))
    .replace(/%rightwinger2/g, rightWinger2)
    .replace(/%Rightwinger2/g, capitaliseFirstLetter(rightWinger2))
    .replace(/%rightwinger/g, rightWinger)
    .replace(/%Rightwinger/g, capitaliseFirstLetter(rightWinger));
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
