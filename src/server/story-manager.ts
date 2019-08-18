import { firestore } from './firestore';
import { IStory } from './story-generator';

export const articleUrls: { [key: string]: number } = {};

const storyCache: { [key: string]: IStory } = {};

// Rehydrate articleUrls
firestore
  .collection('stories')
  .get()
  .then(querySnapshot => {
    querySnapshot.forEach(doc => {
      articleUrls[doc.id] = 1;
    });
  });

export async function getStoryByUrl(url: string): Promise<IStory | null> {
  if (storyCache[url]) {
    return storyCache[url];
  }

  const doc = await firestore
    .collection('stories')
    .doc(url)
    .get();

  if (doc) {
    const story = (await doc.data()) as IStory;

    storyCache[url] = story;

    return story;
  } else {
    return null;
  }
}

export function cacheStory(story: IStory): void {
  storyCache[story.url] = story;
  articleUrls[story.url] = 1;
}

export function shareStory(url: string): Promise<IStory> {
  return new Promise((resolve, reject) => {
    if (storyCache[url]) {
      firestore
        .collection('stories')
        .doc(url)
        .set(storyCache[url])
        .then(() => resolve(storyCache[url]))
        .catch(reject);
    } else {
      reject();
    }
  });
}
