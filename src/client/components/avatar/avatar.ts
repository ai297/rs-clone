import { CSSClasses, ImagesPaths, Tags } from '../../enums';
import { BaseComponent } from '../base-component';
import { AvatarTypes } from './avatar-types';

function createImage(path: string): HTMLImageElement {
  const image = document.createElement(Tags.Img);
  image.src = path;
  return image;
}

export class Avatar extends BaseComponent {
  private readonly images: Map<AvatarTypes, HTMLImageElement> = new Map();

  constructor(
    private readonly heroId: string,
    private type = AvatarTypes.Avatar,
    classes: Array<CSSClasses> = [],
  ) {
    super([CSSClasses.Avatar, ...classes]);

    this.images.set(AvatarTypes.Avatar, createImage(`${ImagesPaths.HeroesAvatars}${heroId}.png`))
      .set(AvatarTypes.FullSize, createImage(`${ImagesPaths.HeroesFullSize}${heroId}.jpg`))
      .set(AvatarTypes.DeathWizzard, createImage(`${ImagesPaths.HeroesDeaths}${heroId}.png`));

    this.changeType(type);
  }

  changeType(type: AvatarTypes): void {
    this.element.style.backgroundImage = (<HTMLImageElement> this.images.get(type)).src;
  }
}
