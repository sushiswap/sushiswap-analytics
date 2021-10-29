import css from "styled-jsx/css";

// Use styled-jsx instead of global CSS because global CSS
// does not work for AMP pages: https://github.com/vercel/next.js/issues/10549
export default css.global`
  @font-face {
    font-family: "Poppins";
    font-style: normal;
    font-weight: 100;
    font-display: block;
    src: url(/fonts/Poppins-Thin.ttf) format("ttf");
  }
  @font-face {
    font-family: "Poppins";
    font-style: normal;
    font-weight: 200;
    font-display: block;
    src: url(/fonts/Poppins-ExtraLight.ttf) format("ttf");
  }
  @font-face {
    font-family: "Poppins";
    font-style: normal;
    font-weight: 300;
    font-display: block;
    src: url(/fonts/Poppins-Light.ttf) format("ttf");
  }
  @font-face {
    font-family: "Poppins";
    font-style: normal;
    font-weight: 400;
    font-display: block;
    src: url(/fonts/Poppins-Regular.ttf) format("ttf");
  }
  @font-face {
    font-family: "Poppins";
    font-style: normal;
    font-weight: 500;
    font-display: block;
    src: url(/fonts/Poppins-Medium.ttf) format("ttf");
  }
  @font-face {
    font-family: "Poppins";
    font-style: normal;
    font-weight: 600;
    font-display: block;
    src: url(/fonts/Poppins-SemiBold.ttf) format("ttf");
  }
  @font-face {
    font-family: "Poppins";
    font-style: normal;
    font-weight: 700;
    font-display: block;
    src: url(/fonts/Poppins-Bold.ttf) format("ttf");
  }
  @font-face {
    font-family: "Poppins";
    font-style: normal;
    font-weight: 800;
    font-display: block;
    src: url(/fonts/Poppins-ExtraBold.ttf) format("ttf");
  }
  @font-face {
    font-family: "Poppins";
    font-style: normal;
    font-weight: 900;
    font-display: block;
    src: url(/fonts/Poppins-Black.ttf) format("ttf");
  }
`;
