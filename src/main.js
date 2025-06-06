import './style.css';
import barba from '@barba/core';
import { gsap } from "gsap";
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';

hljs.registerLanguage('python', python);

const highlightedCode = hljs.highlight(
  'print("Hello World!")',
  { language: 'python' }
).value;

barba.init({
  transitions: [{
    name: 'opacity-transition',
    leave(data) {
      return gsap.to(data.current.container, {
        opacity: 0,
        duration: 0.5
      });
    },
    enter(data) {
      return gsap.from(data.next.container, {
        opacity: 0
      });
    }
  }]
});
