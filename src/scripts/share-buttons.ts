import { IStory } from '../server/story-generator';

const facebookShareUrl = 'https://facebook.com/sharer/sharer.php?u=https://daily-fail-generator.herokuapp.com/%url%';
const twitterShareUrl = 'https://twitter.com/intent/tweet/?text=%headline%&url=https://daily-fail-generator.herokuapp.com/%url%';

class ShareButtons {
  private url: string;
  private facebookButton: HTMLButtonElement;
  private twitterButton: HTMLButtonElement;
  private copyButton: HTMLButtonElement;
  private copyButtonText: HTMLElement;
  private originalCopyButtonText: string;
  private clipboard: HTMLInputElement;
  private copyButtonTimeout: NodeJS.Timer | number;

  constructor(context: HTMLElement) {
    this.url = context.getAttribute('data-url') as string;

    this.facebookButton = context.querySelector('.js-share-facebook') as HTMLButtonElement;
    this.twitterButton = context.querySelector('.js-share-twitter') as HTMLButtonElement;
    this.copyButton = context.querySelector('.js-share-copy') as HTMLButtonElement;
    this.copyButtonText = this.copyButton.querySelector('.js-share-copy-text') as HTMLElement;
    this.originalCopyButtonText = this.copyButtonText.innerText;
    this.clipboard = context.querySelector('.js-share-clipboard') as HTMLInputElement;

    this.facebookButton.addEventListener('click', this.shareToFacebook.bind(this));
    this.twitterButton.addEventListener('click', this.shareToTwitter.bind(this));
    this.copyButton.addEventListener('click', this.shareToClipboard.bind(this));

    context.classList.remove('ShareButtons--hidden');
  }

  private shareToFacebook(): void {
    this.facebookButton.disabled = true;

    this.saveStory()
      .then(story => {
        window.open(this.generateURL(facebookShareUrl, story), '_blank');

        this.facebookButton.disabled = false;
      })
      .catch(this.handleError.bind(this));
  }

  private shareToTwitter(): void {
    this.twitterButton.disabled = true;

    this.saveStory()
      .then(story => {
        window.open(this.generateURL(twitterShareUrl, story), '_blank');

        this.twitterButton.disabled = false;
      })
      .catch(this.handleError.bind(this));
  }

  private shareToClipboard(): void {
    this.copyButton.disabled = true;

    this.saveStory()
      .then(story => {
        if (this.copyButtonTimeout) {
          clearTimeout(this.copyButtonTimeout as number);
        }

        this.clipboard.value = story.url;

        this.copyButton.classList.add('Button--copy-flash');

        setTimeout(() => {
          this.copyButton.classList.remove('Button--copy-flash');
        }, 200);

        setTimeout(() => {
          this.clipboard.select();

          document.execCommand('copy');

          this.copyButtonText.innerText = 'Link copied to clipboard';

          this.copyButtonTimeout = setTimeout(() => {
            this.copyButtonText.innerText = this.originalCopyButtonText;
          }, 2000);
          this.copyButton.disabled = false;
        });
      })
      .catch(this.handleError.bind(this));
  }

  private saveStory(): Promise<IStory> {
    return new Promise((resolve, reject) => {
      fetch(`/share?url=${this.url}`)
        .then(async response => {
          const story = await response.json();

          resolve(story);
        })
        .catch(() => {
          this.facebookButton.disabled = true;
          this.twitterButton.disabled = true;
          this.copyButton.disabled = true;

          reject();
        });
    });
  }

  private handleError(error: Error): void {
    console.log(error);

    alert('Sorry, could not generate a share link. Please try again later.');
  }

  private generateURL(url: string, story: IStory): string {
    return url.replace(/%url%/g, encodeURI(story.url)).replace(/%headline%/g, encodeURI(story.headline));
  }
}

function initialise(): void {
  [...document.querySelectorAll('.js-share')].forEach(item => new ShareButtons(item as HTMLElement));
}

initialise();
