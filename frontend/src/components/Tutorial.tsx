import React from "react";
import PropTypes from "prop-types";
const shaka = require("shaka-player/dist/shaka-player.ui.js");

interface TutorialProps {
  manifestUrl: string;
}

class Tutorial extends React.PureComponent<TutorialProps> {
  private video = React.createRef<HTMLVideoElement>();
  private videoContainer = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const { manifestUrl } = this.props;

    let video = this.video.current;
    let videoContainer = this.videoContainer.current;

    var player = new shaka.Player(video);

    const ui = new shaka.ui.Overlay(player, videoContainer, video);
    const controls = ui.getControls();

    console.log(Object.keys(shaka.ui));

    player.configure({});

    const onError = (error: any) => {
      // Log the error.
      console.error("Error code", error.code, "object", error);
    };

    player
      .load(manifestUrl)
      .then(() => {
        // This runs if the asynchronous load is successful.
        console.log("The video has now been loaded!");
      })
      .catch(onError); // onError is executed if the asynchronous load fails.
  }

  render() {
    return (
      <div
        className="shadow-lg mx-auto max-w-full"
        ref={this.videoContainer}
        style={{ width: "800px" }}
      >
        hello
        <audio id="video" ref={this.video} className="w-full h-full"></audio>
      </div>
    );
  }

  static propTypes = {
    manifestUrl: PropTypes.string.isRequired,
  };
}

export default Tutorial;
