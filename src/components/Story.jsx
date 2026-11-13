import { SHOP } from '../shop.js';

export default function Story() {
  return (
    <section id="story" className="section">
      <div className="wrap story">
        <div className="story-img reveal">
          <img src="images/story.svg" alt="구룡포 바닷가 덕장에 과메기가 걸려 있는 풍경" loading="lazy" />
        </div>
        <div className="story-text reveal">
          <p className="eyebrow">OUR STORY</p>
          <h2 className="title">구룡포 바닷가에서<br />겨울마다 과메기를 말립니다</h2>
          <p>
            과메기는 날씨가 만듭니다. 영하로 떨어지는 밤에 얼고, 햇볕 드는 낮에 녹기를 수없이
            되풀이해야 겉은 꾸덕하고 속은 촉촉한 과메기가 됩니다.
          </p>
          <p>
            {SHOP.name}는 기계 건조 없이 동해 바닷바람에만 말립니다. 날씨가 맞지 않으면 기다리고,
            잘 마른 것만 골라 손으로 하나하나 손질합니다.
          </p>
          <div className="sign">— {SHOP.name} 대표 <b>{SHOP.owner}</b></div>
        </div>
      </div>
    </section>
  );
}
