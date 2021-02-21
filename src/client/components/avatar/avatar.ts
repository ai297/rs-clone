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
    heroId: string,
    type = AvatarTypes.Avatar,
    classes: Array<CSSClasses> = [],
  ) {
    super([CSSClasses.Avatar, ...classes]);

    const avatar = `${ImagesPaths.HeroesAvatars}${heroId}.png`;
    const death = `${ImagesPaths.HeroesDeaths}${heroId}.png`;
    const fullSize = `${ImagesPaths.HeroesFullSize}${heroId}.jpg`;

    this.images.set(AvatarTypes.Avatar, createImage(avatar))
      .set(AvatarTypes.FullSize, createImage(fullSize))
      .set(AvatarTypes.DeathWizzard, createImage(death));

    this.changeType(type);
  }

  changeType(type: AvatarTypes): void {
    this.element.style.backgroundImage = this.images.has(type) ? `url("${this.images.get(type)?.src}")` : '';
  }
}
