import { quintOut } from 'eases-jsnext';

export function flip(node, animation, params){

  const dx = animation.from.left - animation.to.left;
  const dy = animation.from.top - animation.to.top;

  const d = Math.sqrt(dx * dx + dy * dy);
  const z = Math.sqrt(Math.abs(d));

  // make sure 'closer' items
  // appear on top of 'further' items
  node.style.zIndex = ~~(z * 100);

  return {
    duration: 400,
    easing: quintOut,
    css: (t, u) => {
      return `
              transform: translate(${u * dx}px, ${u * dy}px);
            `
    }
  };
}