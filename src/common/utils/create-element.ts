import { Tags, CSSClasses } from '../../client/enums';

export function createElement(
  tag: Tags,
  cssClass: Array<CSSClasses>, /* array enum classes - [CSSClasses.class1, CSSClasses.class2, ...] */
  title?: string,
): HTMLElement {
  const element = document.createElement(tag);
  const classes: string = cssClass.join(' ');

  element.classList.add(...classes.split(' '));
  element.innerText = title;

  return element;
}
