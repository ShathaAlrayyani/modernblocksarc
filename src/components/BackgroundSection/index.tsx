import "./BackgroundSection.scss";
import { imgsList } from "../../constants";

// interface IBackgroundSectionProps {
//   imgSrc: string;
//   text: string;
//   title: string;
// }
export const BackgroundSection = () => {
  return (
    <section className="mainSection">
      {imgsList.map((item, index) => (
        <div className="sectionWrapper" key={index + 1}>
          <img className="bgImg" src={item.imgSrc} alt={item.title} />
          <div className="textContainer">
            <div className="headerWrapper">
              <h1 className="header">{item.title}</h1>
            </div>
            <p className="text">{item.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
};
