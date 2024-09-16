import React from "react";
import dynamic from "next/dynamic";

const TutorialContainer = dynamic(import("../components/Tutorial"), {
  ssr: false,
});

class Tutorial extends React.PureComponent {
  render() {
    const mpdFile =
      "http://localhost:8080/api/v1/stream/I94fhjQ-U30/manifest.mpd";

    return <TutorialContainer manifestUrl={mpdFile} />;
  }
}

export default Tutorial;
